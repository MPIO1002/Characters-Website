import { Request, Response } from 'express';
import pool from '../db';
import { uploadToCloudinary } from '../services/uploadService';
import { getCachedData, setCachedData, deleteCachedData } from '../services/cacheService';

export const getHeroes = async (req: Request, res: Response) => {
  const cacheKey = 'heroes:all';
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const result = await pool.query('SELECT * FROM heroes');
    const responseData = {
      succeed: true,
      message: 'Heroes retrieved successfully',
      data: result.rows
    };

    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
};

export const getHeroById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `hero:${id}`;

  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const characterResult = await pool.query('SELECT * FROM "heroes" WHERE id = $1', [parseInt(id)]);
    if (characterResult.rows.length === 0) {
      return res.status(404).json({
        succeed: false,
        message: 'Không tìm thấy tướng'
      });
    }

    const character = characterResult.rows[0];
    const skillResult = await pool.query('SELECT * FROM "skill" WHERE hero_id = $1', [parseInt(id)]);
    const skills = skillResult.rows;
    const fateResult = await pool.query('SELECT * FROM "fate" WHERE hero_id = $1', [parseInt(id)]);
    const fates = fateResult.rows;
    const petResult = await pool.query('SELECT * FROM "pet" WHERE hero_id = $1', [parseInt(id)]);
    const pets = petResult.rows;
    const artifactResult = await pool.query('SELECT * FROM "artifact" WHERE hero_id = $1', [parseInt(id)]);
    const artifacts = artifactResult.rows;

    const responseData = {
      succeed: true,
      message: 'Character retrieved successfully',
      data: {
        ...character,
        skills,
        fates,
        pets,
        artifacts
      }
    };
    
    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
};

export const createHero = async (req: Request, res: Response) => {
  const { name, story, skills, pets, fates, artifacts } = req.body;
  if (!req.files || !('img' in req.files) || !('transform' in req.files)) {
    return res.status(400).json({ succeed: false, message: 'Missing required files' });
  }
  
  const img = (req.files['img'] as Express.Multer.File[])[0];
  const transform = (req.files['transform'] as Express.Multer.File[])[0];

  const parsedSkills = JSON.parse(skills);
  const parsedPets = JSON.parse(pets);
  const parsedFates = JSON.parse(fates);
  const parsedArtifacts = JSON.parse(artifacts);

  try {
    const imgUploadResult = await uploadToCloudinary(img.buffer);
    const transformUploadResult = await uploadToCloudinary(transform.buffer);

    const heroResult = await pool.query(
      'INSERT INTO "heroes" (name, img, story, transform) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, imgUploadResult.secure_url, story, transformUploadResult.secure_url]
    );
    const heroId = heroResult.rows[0].id;

    for (const skill of parsedSkills) {
      await pool.query(
        'INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)',
        [skill.name, skill.star, skill.description, heroId]
      );
    }
    
    for (const pet of parsedPets) {
      await pool.query(
        'INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)',
        [pet.name, pet.description, heroId]
      );
    }
    
    for (const fate of parsedFates) {
      await pool.query(
        'INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)',
        [fate.name, fate.description, heroId]
      );
    }
    
    for (const artifact of parsedArtifacts) {
      await pool.query(
        'INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)',
        [artifact.name, artifact.description, heroId]
      );
    }

    await deleteCachedData('heroes:all');
    res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
  } catch (err) {
    console.error('Error creating hero:', err);
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const updateHero = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, story, skills, pets, fates, artifacts } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const img = files?.['img'] ? files['img'][0] : null;
  const transform = files?.['transform'] ? files['transform'][0] : null;

  const parsedSkills = JSON.parse(skills);
  const parsedPets = JSON.parse(pets);
  const parsedFates = JSON.parse(fates);
  const parsedArtifacts = JSON.parse(artifacts);

  try {
    let imgUploadResult, transformUploadResult;

    if (img) {
      imgUploadResult = await uploadToCloudinary(img.buffer);
    }

    if (transform) {
      transformUploadResult = await uploadToCloudinary(transform.buffer);
    }

    await pool.query(
      'UPDATE "heroes" SET name = $1, img = COALESCE($2, img), story = $3, transform = COALESCE($4, transform) WHERE id = $5',
      [name, imgUploadResult?.secure_url, story, transformUploadResult?.secure_url, parseInt(id)]
    );

    // Update skills
    for (const skill of parsedSkills) {
      if (!skill.id) {
        await pool.query(
          'INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)',
          [skill.name, skill.star, skill.description, id]
        );
      } else {
        await pool.query(
          'UPDATE "skill" SET name = $1, star = $2, description = $3 WHERE id = $4 AND hero_id = $5',
          [skill.name, skill.star, skill.description, skill.id, id]
        );
      }
    }

    // Update pets
    for (const pet of parsedPets) {
      if (!pet.id) {
        await pool.query(
          'INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)',
          [pet.name, pet.description, id]
        );
      } else {
        await pool.query(
          'UPDATE "pet" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
          [pet.name, pet.description, pet.id, id]
        );
      }
    }

    // Update fates
    for (const fate of parsedFates) {
      if (!fate.id) {
        await pool.query(
          'INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)',
          [fate.name, fate.description, id]
        );
      } else {
        await pool.query(
          'UPDATE "fate" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
          [fate.name, fate.description, fate.id, id]
        );
      }
    }

    // Update artifacts
    for (const artifact of parsedArtifacts) {
      if (!artifact.id) {
        await pool.query(
          'INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)',
          [artifact.name, artifact.description, id]
        );
      } else {
        await pool.query(
          'UPDATE "artifact" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
          [artifact.name, artifact.description, artifact.id, id]
        );
      }
    }
    
    await deleteCachedData('heroes:all');
    await deleteCachedData(`hero:${id}`);
    res.status(200).json({ succeed: true, message: 'Cập nhật tướng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const deleteHero = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleteResult = await pool.query('DELETE FROM "heroes" WHERE id = $1 RETURNING id', [parseInt(id)]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        succeed: false,
        message: 'Không tìm thấy tướng để xóa'
      });
    }
    
    await deleteCachedData('heroes:all');
    await deleteCachedData(`hero:${id}`);
    
    res.status(200).json({
      succeed: true,
      message: 'Xóa tướng thành công'
    });
  } catch (err) {
    console.error('Error deleting hero:', err);
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
};
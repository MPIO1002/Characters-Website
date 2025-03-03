import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './db';
import authRoutes from './auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lấy chi tiết thông tin nhân vật qua ID
app.get('/heroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
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

    res.status(200).json({
      succeed: true,
      message: 'Character retrieved successfully',
      data: {
        ...character,
        skills,
        fates,
        pets,
        artifacts
      }
    });
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
});

// Lấy danh sách tất cả các nhân vật
app.get('/heroes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM heroes');
    res.status(200).json({
      succeed: true,
      message: 'Heroes retrieved successfully',
      data: result.rows
    });
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
});

// Thêm nhân vật mới
app.post('/heroes', async (req, res) => {
  const { name, img, story, transform, skills, pets, fates, artifacts } = req.body;
  try {
    const heroResult = await pool.query(
      'INSERT INTO "heroes" (name, img, story, transform) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, img, story, transform]
    );
    const heroId = heroResult.rows[0].id;
    console.log(`Hero created with id: ${heroId}`);

    for (const skill of skills) {
      console.log(`Inserting skill: ${JSON.stringify(skill)}`);
      await pool.query(
        'INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)',
        [skill.name, skill.star, skill.description, heroId]
      );
    }
    for (const pet of pets) {
      console.log(`Inserting pet: ${JSON.stringify(pet)}`);
      await pool.query(
        'INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)',
        [pet.name, pet.description, heroId]
      );
    }
    for (const fate of fates) {
      console.log(`Inserting fate: ${JSON.stringify(fate)}`);
      await pool.query(
        'INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)',
        [fate.name, fate.description, heroId]
      );
    }
    for (const artifact of artifacts) {
      console.log(`Inserting artifact: ${JSON.stringify(artifact)}`);
      await pool.query(
        'INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)',
        [artifact.name, artifact.description, heroId]
      );
    }

    res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
  } catch (err) {
    console.error('Error creating hero:', err);
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Cập nhật thông tin nhân vật
app.put('/heroes/:id', async (req, res) => {
  const { id } = req.params;
  const { name, img, story, transform, skills, pets, fates, artifacts } = req.body;
  try {
    await pool.query(
      'UPDATE "heroes" SET name = $1, img = $2, story = $3, transform = $4 WHERE id = $5',
      [name, img, story, transform, parseInt(id)]
    );

    // Update skills
    for (const skill of skills) {
      if (!skill.id) {
        continue;
      }
      console.log(`Updating skill with id: ${skill.id} for hero_id: ${id}`);
      await pool.query(
        'UPDATE "skill" SET name = $1, star = $2, description = $3 WHERE id = $4 AND hero_id = $5',
        [skill.name, skill.star, skill.description, skill.id, id]
      );
    }

    // Update pets
    for (const pet of pets) {
      if (!pet.id) {
        continue;
      }
      await pool.query(
        'UPDATE "pet" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
        [pet.name, pet.description, pet.id, id]
      );
    }

    // Update fates
    for (const fate of fates) {
      if (!fate.id) {
        continue;
      }
      await pool.query(
        'UPDATE "fate" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
        [fate.name, fate.description, fate.id, id]
      );
    }

    // Update artifacts
    for (const artifact of artifacts) {
      if (!artifact.id) {
        continue;
      }
      await pool.query(
        'UPDATE "artifact" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4',
        [artifact.name, artifact.description, artifact.id, id]
      );
    }

    res.status(200).json({ succeed: true, message: 'Cập nhật tướng thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});
// Xóa nhân vật qua ID
app.delete('/heroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleteResult = await pool.query('DELETE FROM "heroes" WHERE id = $1 RETURNING id', [parseInt(id)]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        succeed: false,
        message: 'Không tìm thấy tướng để xóa'
      });
    }
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
});

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
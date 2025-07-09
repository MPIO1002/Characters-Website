import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './db';
import authRoutes from './auth';
import dotenv from 'dotenv';
import cloudinary from './cloudinary-config';
import { UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import redisClient from './redis-client';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const port = 3000;
const host = "0.0.0.0";

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3001',
    'https://monghuyen.gianhgo.me'
  ],
  credentials: true
}));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3001',
      'https://monghuyen.gianhgo.me'
    ],
    credentials: true
  }
});

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

redisClient.connect();

// Lấy chi tiết thông tin nhân vật qua ID
app.get('/heroes/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `hero:${id}`;

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
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
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
});

// Lấy danh sách tất cả các nhân vật
app.get('/heroes', async (req, res) => {
  const cacheKey = 'heroes:all';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const result = await pool.query('SELECT * FROM heroes');
    const responseData = {
      succeed: true,
      message: 'Heroes retrieved successfully',
      data: result.rows
    };

    // Lưu vào cache 30 phút
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({
      succeed: false,
      message: (err as Error).message
    });
  }
});

// Thêm nhân vật mới
app.post('/heroes', upload.fields([{ name: 'img' }, { name: 'transform' }]), async (req, res) => {
  const { name, story, skills, pets, fates, artifacts } = req.body;
  if (!req.files || !('img' in req.files) || !('transform' in req.files)) {
    return res.status(400).json({ succeed: false, message: 'Missing required files' });
  }
  const img = (req.files['img'] as Express.Multer.File[])[0];
  const transform = (req.files['transform'] as Express.Multer.File[])[0];

  // Parse the JSON strings into objects
  const parsedSkills = JSON.parse(skills);
  const parsedPets = JSON.parse(pets);
  const parsedFates = JSON.parse(fates);
  const parsedArtifacts = JSON.parse(artifacts);

  try {
    const imgUploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload result is undefined'));
      }).end(img.buffer);
    });

    const transformUploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
        if (error) reject(error);
        else if (result) resolve(result);
        else reject(new Error('Upload result is undefined'));
      }).end(transform.buffer);
    });

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

    await redisClient.del('heroes:all');
    res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
  } catch (err) {
    console.error('Error creating hero:', err);
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Cập nhật thông tin nhân vật
app.put('/heroes/:id', upload.fields([{ name: 'img' }, { name: 'transform' }]), async (req, res) => {
  const { id } = req.params;
  const { name, story, skills, pets, fates, artifacts } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const img = files?.['img'] ? files['img'][0] : null;
  const transform = files?.['transform'] ? files['transform'][0] : null;

  // Parse the JSON strings into objects
  const parsedSkills = JSON.parse(skills);
  const parsedPets = JSON.parse(pets);
  const parsedFates = JSON.parse(fates);
  const parsedArtifacts = JSON.parse(artifacts);

  try {
    let imgUploadResult, transformUploadResult;

    if (img) {
      imgUploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(img.buffer);
      });
    }

    if (transform) {
      transformUploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(transform.buffer);
      });
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
    await redisClient.del('heroes:all');
    await redisClient.del(`hero:${id}`);
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
    await redisClient.del('heroes:all');
    await redisClient.del(`hero:${id}`);
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

app.get('/artifact_private', async (req, res) => {
  const cacheKey = 'artifact_private:all';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const result = await pool.query('SELECT * FROM artifact_private');
    const responseData = {
      succeed: true,
      message: 'Lấy danh sách artifact_private thành công',
      data: result.rows
    };
    // Lưu vào cache 30 phút
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Lấy chi tiết artifact_private theo id
app.get('/artifact_private/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `artifact_private:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const result = await pool.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private' });
    }
    const responseData = { succeed: true, message: 'Lấy artifact_private thành công', data: result.rows[0] };
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Thêm artifact_private mới (upload ảnh lên Cloudinary)
app.post('/artifact_private', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), async (req, res) => {
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    // Upload từng ảnh nếu có
    let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;

    if (files?.img && files.img[0]) {
      imgUrl = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_1[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_2[0].buffer);
      })).secure_url;
    }

    const result = await pool.query(
      'INSERT INTO artifact_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url]
    );
    await redisClient.del('artifact_private:all');
    res.status(201).json({ succeed: true, message: 'Thêm artifact_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Cập nhật artifact_private (có thể upload lại ảnh mới)
app.put('/artifact_private/:id', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    // Lấy artifact_private hiện tại để giữ lại url cũ nếu không upload mới
    const current = await pool.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để cập nhật' });
    }
    const artifact = current.rows[0];

    let imgUrl = artifact.img, imgFigure1Url = artifact.img_figure_1, imgFigure2Url = artifact.img_figure_2;

    if (files?.img && files.img[0]) {
      imgUrl = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_1[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_2[0].buffer);
      })).secure_url;
    }

    const result = await pool.query(
      'UPDATE artifact_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]
    );
    await redisClient.del('artifact_private:all');
    await redisClient.del(`artifact_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Cập nhật artifact_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Xóa artifact_private
app.delete('/artifact_private/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM artifact_private WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để xóa' });
    }
    await redisClient.del('artifact_private:all');
    await redisClient.del(`artifact_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Xóa artifact_private thành công' });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Lấy danh sách pet_private
app.get('/pet_private', async (req, res) => {
  const cacheKey = 'pet_private:all';
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const result = await pool.query('SELECT * FROM pet_private');
    const responseData = {
      succeed: true,
      message: 'Lấy danh sách pet_private thành công',
      data: result.rows
    };
    // Lưu vào cache 30 phút
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Lấy chi tiết pet_private theo id
app.get('/pet_private/:id', async (req, res) => {
  const { id } = req.params;
  const cacheKey = `pet_private:${id}`;
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const result = await pool.query('SELECT * FROM pet_private WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private' });
    }
    const responseData = { succeed: true, message: 'Lấy pet_private thành công', data: result.rows[0] };
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(responseData));
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Thêm pet_private mới (upload ảnh lên Cloudinary)
app.post('/pet_private', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), async (req, res) => {
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;

    if (files?.img && files.img[0]) {
      imgUrl = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_1[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_2[0].buffer);
      })).secure_url;
    }

    const result = await pool.query(
      'INSERT INTO pet_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url]
    );
    await redisClient.del('pet_private:all');
    res.status(201).json({ succeed: true, message: 'Thêm pet_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Cập nhật pet_private (có thể upload lại ảnh mới)
app.put('/pet_private/:id', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    const current = await pool.query('SELECT * FROM pet_private WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để cập nhật' });
    }
    const pet = current.rows[0];

    let imgUrl = pet.img, imgFigure1Url = pet.img_figure_1, imgFigure2Url = pet.img_figure_2;

    if (files?.img && files.img[0]) {
      imgUrl = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_1[0].buffer);
      })).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error('Upload result is undefined'));
        }).end(files.img_figure_2[0].buffer);
      })).secure_url;
    }

    const result = await pool.query(
      'UPDATE pet_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]
    );
    await redisClient.del('pet_private:all');
    await redisClient.del(`pet_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Cập nhật pet_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

// Xóa pet_private
app.delete('/pet_private/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pet_private WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để xóa' });
    }
    await redisClient.del('pet_private:all');
    await redisClient.del(`pet_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Xóa pet_private thành công' });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
});

app.use('/auth', authRoutes);

// app.listen(port, host, () => {
//   console.log(`Server is running on ${host}:${port}`);
// });

// Biến đếm người truy cập
let onlineUsers = 0;
let totalVisitors = 0;
const connectedUsers = new Set<string>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Tăng số người online
  onlineUsers++;
  totalVisitors++;
  connectedUsers.add(socket.id);
  
  // Gửi số liệu cập nhật cho tất cả client
  io.emit('userStats', {
    online: onlineUsers,
    total: totalVisitors
  });

  // Xử lý khi user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (connectedUsers.has(socket.id)) {
      onlineUsers--;
      connectedUsers.delete(socket.id);
      
      // Gửi số liệu cập nhật cho tất cả client
      io.emit('userStats', {
        online: onlineUsers,
        total: totalVisitors
      });
    }
  });

  // Xử lý heartbeat để đảm bảo connection còn sống
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// API lấy thống kê (backup cho trường hợp WebSocket không hoạt động)
app.get('/stats', (req, res) => {
  res.json({
    online: onlineUsers,
    total: totalVisitors
  });
});

// Thay đổi app.listen thành server.listen
server.listen(port, host, () => {
  console.log(`Server is running on ${host}:${port}`);
});
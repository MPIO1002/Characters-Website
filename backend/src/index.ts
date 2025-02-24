import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './db';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Thêm nhân vật
// app.post('/characters', async (req, res) => {
//   const { name, story, stat, image, fate, category, origin, skills, skins } = req.body;
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     const characterResult = await client.query(
//       'INSERT INTO "Character" (name, story, stat, image, fate, category, origin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
//       [name, story, stat, image, fate, category, origin]
//     );
//     const character = characterResult.rows[0];

//     if (skills && skills.length > 0) {
//       for (const skill of skills) {
//         await client.query(
//           'INSERT INTO "Skill" (character_id, name, description, img_url) VALUES ($1, $2, $3)',
//           [character.id, skill.name, skill.description, skill.img_url]
//         );
//       }
//     }

//     if (skins && skins.length > 0) {
//       for (const skin of skins) {
//         await client.query(
//           'INSERT INTO "Skin" (character_id, name, img_url) VALUES ($1, $2, $3)',
//           [character.id, skin.name, skin.img_url]
//         );
//       }
//     }

//     await client.query('COMMIT');
//     res.status(201).json({
//       succeed: true,
//       message: 'Character added successfully',
//       data: character
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     res.status(500).json({
//       succeed: false,
//       message: (err as Error).message
//     });
//   } finally {
//     client.release();
//   }
// });

// // Sửa nhân vật
// app.put('/characters/:id', async (req, res) => {
//   const { id } = req.params;
//   const { name, story, stat, image, fate, category, origin, skills, skins } = req.body;
//   const client = await pool.connect();
//   try {
//     await client.query('BEGIN');
//     console.log('Received data:', req.body); // Thêm dòng này để kiểm tra dữ liệu nhận được
//     const characterResult = await client.query(
//       'UPDATE "Character" SET name = $1, story = $2, stat = $3, image = $4, fate = $5, category = $6, origin = $7 WHERE id = $8 RETURNING *',
//       [name, story, stat, image, fate, category, origin, id]
//     );
//     const character = characterResult.rows[0];

//     await client.query('DELETE FROM "Skill" WHERE character_id = $1', [id]);
//     if (skills && skills.length > 0) {
//       for (const skill of skills) {
//         await client.query(
//           'INSERT INTO "Skill" (character_id, name, description) VALUES ($1, $2, $3)',
//           [id, skill.name, skill.description]
//         );
//       }
//     }

//     await client.query('DELETE FROM "Skin" WHERE character_id = $1', [id]);
//     if (skins && skins.length > 0) {
//       for (const skin of skins) {
//         await client.query(
//           'INSERT INTO "Skin" (character_id, name, img_url) VALUES ($1, $2, $3)',
//           [id, skin.name, skin.img_url]
//         );
//       }
//     }

//     await client.query('COMMIT');
//     res.status(200).json({
//       succeed: true,
//       message: 'Character updated successfully',
//       data: character
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Error updating character:', err); // Thêm dòng này để kiểm tra lỗi chi tiết
//     res.status(500).json({
//       succeed: false,
//       message: (err as Error).message
//     });
//   } finally {
//     client.release();
//   }
// });

// // Xóa nhân vật
// app.delete('/characters/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('DELETE FROM "Character" WHERE id = $1', [id]);
//     res.status(204).json({
//       succeed: true,
//       message: 'Character deleted successfully'
//     });
//   } catch (err) {
//     res.status(500).json({
//       succeed: false,
//       message: (err as Error).message
//     });
//   }
// });

// // Lấy chi tiết thông tin nhân vật qua ID
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
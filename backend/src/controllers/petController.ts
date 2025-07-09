import { Request, Response } from 'express';
import pool from '../db';
import { uploadToCloudinary } from '../services/uploadService';
import { getCachedData, setCachedData, deleteCachedData } from '../services/cacheService';

export const getPets = async (req: Request, res: Response) => {
  const cacheKey = 'pet_private:all';
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const result = await pool.query('SELECT * FROM pet_private');
    const responseData = {
      succeed: true,
      message: 'Lấy danh sách pet_private thành công',
      data: result.rows
    };
    
    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const getPetById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `pet_private:${id}`;
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const result = await pool.query('SELECT * FROM pet_private WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private' });
    }
    
    const responseData = { succeed: true, message: 'Lấy pet_private thành công', data: result.rows[0] };
    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const createPet = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;

    if (files?.img && files.img[0]) {
      imgUrl = (await uploadToCloudinary(files.img[0].buffer)).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await uploadToCloudinary(files.img_figure_1[0].buffer)).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await uploadToCloudinary(files.img_figure_2[0].buffer)).secure_url;
    }

    const result = await pool.query(
      'INSERT INTO pet_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url]
    );
    
    await deleteCachedData('pet_private:all');
    res.status(201).json({ succeed: true, message: 'Thêm pet_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const updatePet = async (req: Request, res: Response) => {
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
      imgUrl = (await uploadToCloudinary(files.img[0].buffer)).secure_url;
    }

    if (files?.img_figure_1 && files.img_figure_1[0]) {
      imgFigure1Url = (await uploadToCloudinary(files.img_figure_1[0].buffer)).secure_url;
    }

    if (files?.img_figure_2 && files.img_figure_2[0]) {
      imgFigure2Url = (await uploadToCloudinary(files.img_figure_2[0].buffer)).secure_url;
    }

    const result = await pool.query(
      'UPDATE pet_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]
    );
    
    await deleteCachedData('pet_private:all');
    await deleteCachedData(`pet_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Cập nhật pet_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const deletePet = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pet_private WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để xóa' });
    }
    
    await deleteCachedData('pet_private:all');
    await deleteCachedData(`pet_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Xóa pet_private thành công' });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};
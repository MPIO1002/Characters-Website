import { Request, Response } from 'express';
import pool from '../db';
import { uploadToCloudinary } from '../services/uploadService';
import { getCachedData, setCachedData, deleteCachedData } from '../services/cacheService';

export const getArtifacts = async (req: Request, res: Response) => {
  const cacheKey = 'artifact_private:all';
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const result = await pool.query('SELECT * FROM artifact_private');
    const responseData = {
      succeed: true,
      message: 'Lấy danh sách artifact_private thành công',
      data: result.rows
    };
    
    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const getArtifactById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const cacheKey = `artifact_private:${id}`;
  try {
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
    
    const result = await pool.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private' });
    }
    
    const responseData = { succeed: true, message: 'Lấy artifact_private thành công', data: result.rows[0] };
    await setCachedData(cacheKey, responseData);
    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const createArtifact = async (req: Request, res: Response) => {
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
      'INSERT INTO artifact_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url]
    );
    
    await deleteCachedData('artifact_private:all');
    res.status(201).json({ succeed: true, message: 'Thêm artifact_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const updateArtifact = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  try {
    const current = await pool.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để cập nhật' });
    }
    const artifact = current.rows[0];

    let imgUrl = artifact.img, imgFigure1Url = artifact.img_figure_1, imgFigure2Url = artifact.img_figure_2;

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
      'UPDATE artifact_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *',
      [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]
    );
    
    await deleteCachedData('artifact_private:all');
    await deleteCachedData(`artifact_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Cập nhật artifact_private thành công', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};

export const deleteArtifact = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM artifact_private WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để xóa' });
    }
    
    await deleteCachedData('artifact_private:all');
    await deleteCachedData(`artifact_private:${id}`);
    res.status(200).json({ succeed: true, message: 'Xóa artifact_private thành công' });
  } catch (err) {
    res.status(500).json({ succeed: false, message: (err as Error).message });
  }
};
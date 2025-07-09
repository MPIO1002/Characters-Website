import { Router } from 'express';
import { upload } from '../middleware/upload';
import { getPets, getPetById, createPet, updatePet, deletePet } from '../controllers/petController';

const router = Router();

router.get('/', getPets);
router.get('/:id', getPetById);
router.post('/', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), createPet);
router.put('/:id', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), updatePet);
router.delete('/:id', deletePet);

export default router;
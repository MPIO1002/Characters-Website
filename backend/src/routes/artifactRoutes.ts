import { Router } from 'express';
import { upload } from '../middleware/upload';
import { getArtifacts, getArtifactById, createArtifact, updateArtifact, deleteArtifact } from '../controllers/artifactController';

const router = Router();

router.get('/', getArtifacts);
router.get('/:id', getArtifactById);
router.post('/', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), createArtifact);
router.put('/:id', upload.fields([
  { name: 'img', maxCount: 1 },
  { name: 'img_figure_1', maxCount: 1 },
  { name: 'img_figure_2', maxCount: 1 }
]), updateArtifact);
router.delete('/:id', deleteArtifact);

export default router;
import { Router } from 'express';
import { upload } from '../middleware/upload';
import { getHeroes, getHeroById, createHero, updateHero, deleteHero } from '../controllers/heroController';

const router = Router();

router.get('/', getHeroes);
router.get('/:id', getHeroById);
router.post('/', upload.fields([{ name: 'img' }, { name: 'transform' }]), createHero);
router.put('/:id', upload.fields([{ name: 'img' }, { name: 'transform' }]), updateHero);
router.delete('/:id', deleteHero);

export default router;
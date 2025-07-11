"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const petController_1 = require("../controllers/petController");
const router = (0, express_1.Router)();
router.get('/', petController_1.getPets);
router.get('/:id', petController_1.getPetById);
router.post('/', upload_1.upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), petController_1.createPet);
router.put('/:id', upload_1.upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), petController_1.updatePet);
router.delete('/:id', petController_1.deletePet);
exports.default = router;

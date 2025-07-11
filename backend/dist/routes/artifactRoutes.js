"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const artifactController_1 = require("../controllers/artifactController");
const router = (0, express_1.Router)();
router.get('/', artifactController_1.getArtifacts);
router.get('/:id', artifactController_1.getArtifactById);
router.post('/', upload_1.upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), artifactController_1.createArtifact);
router.put('/:id', upload_1.upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), artifactController_1.updateArtifact);
router.delete('/:id', artifactController_1.deleteArtifact);
exports.default = router;

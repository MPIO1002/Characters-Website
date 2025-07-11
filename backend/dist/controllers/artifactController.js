"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArtifact = exports.updateArtifact = exports.createArtifact = exports.getArtifactById = exports.getArtifacts = void 0;
const db_1 = __importDefault(require("../db"));
const uploadService_1 = require("../services/uploadService");
const cacheService_1 = require("../services/cacheService");
const getArtifacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'artifact_private:all';
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const result = yield db_1.default.query('SELECT * FROM artifact_private');
        const responseData = {
            succeed: true,
            message: 'Lấy danh sách artifact_private thành công',
            data: result.rows
        };
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.getArtifacts = getArtifacts;
const getArtifactById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `artifact_private:${id}`;
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const result = yield db_1.default.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private' });
        }
        const responseData = { succeed: true, message: 'Lấy artifact_private thành công', data: result.rows[0] };
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.getArtifactById = getArtifactById;
const createArtifact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const files = req.files;
    try {
        let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield (0, uploadService_1.uploadToCloudinary)(files.img[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_1[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_2[0].buffer)).secure_url;
        }
        const result = yield db_1.default.query('INSERT INTO artifact_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url]);
        yield (0, cacheService_1.deleteCachedData)('artifact_private:all');
        res.status(201).json({ succeed: true, message: 'Thêm artifact_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.createArtifact = createArtifact;
const updateArtifact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description } = req.body;
    const files = req.files;
    try {
        const current = yield db_1.default.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để cập nhật' });
        }
        const artifact = current.rows[0];
        let imgUrl = artifact.img, imgFigure1Url = artifact.img_figure_1, imgFigure2Url = artifact.img_figure_2;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield (0, uploadService_1.uploadToCloudinary)(files.img[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_1[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_2[0].buffer)).secure_url;
        }
        const result = yield db_1.default.query('UPDATE artifact_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]);
        yield (0, cacheService_1.deleteCachedData)('artifact_private:all');
        yield (0, cacheService_1.deleteCachedData)(`artifact_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật artifact_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.updateArtifact = updateArtifact;
const deleteArtifact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query('DELETE FROM artifact_private WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để xóa' });
        }
        yield (0, cacheService_1.deleteCachedData)('artifact_private:all');
        yield (0, cacheService_1.deleteCachedData)(`artifact_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Xóa artifact_private thành công' });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.deleteArtifact = deleteArtifact;

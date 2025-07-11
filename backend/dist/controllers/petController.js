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
exports.deletePet = exports.updatePet = exports.createPet = exports.getPetById = exports.getPets = void 0;
const db_1 = __importDefault(require("../db"));
const uploadService_1 = require("../services/uploadService");
const cacheService_1 = require("../services/cacheService");
const getPets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'pet_private:all';
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const result = yield db_1.default.query('SELECT * FROM pet_private');
        const responseData = {
            succeed: true,
            message: 'Lấy danh sách pet_private thành công',
            data: result.rows
        };
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.getPets = getPets;
const getPetById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `pet_private:${id}`;
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const result = yield db_1.default.query('SELECT * FROM pet_private WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private' });
        }
        const responseData = { succeed: true, message: 'Lấy pet_private thành công', data: result.rows[0] };
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.getPetById = getPetById;
const createPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield db_1.default.query('INSERT INTO pet_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url]);
        yield (0, cacheService_1.deleteCachedData)('pet_private:all');
        res.status(201).json({ succeed: true, message: 'Thêm pet_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.createPet = createPet;
const updatePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description } = req.body;
    const files = req.files;
    try {
        const current = yield db_1.default.query('SELECT * FROM pet_private WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để cập nhật' });
        }
        const pet = current.rows[0];
        let imgUrl = pet.img, imgFigure1Url = pet.img_figure_1, imgFigure2Url = pet.img_figure_2;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield (0, uploadService_1.uploadToCloudinary)(files.img[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_1[0].buffer)).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield (0, uploadService_1.uploadToCloudinary)(files.img_figure_2[0].buffer)).secure_url;
        }
        const result = yield db_1.default.query('UPDATE pet_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]);
        yield (0, cacheService_1.deleteCachedData)('pet_private:all');
        yield (0, cacheService_1.deleteCachedData)(`pet_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật pet_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.updatePet = updatePet;
const deletePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query('DELETE FROM pet_private WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để xóa' });
        }
        yield (0, cacheService_1.deleteCachedData)('pet_private:all');
        yield (0, cacheService_1.deleteCachedData)(`pet_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Xóa pet_private thành công' });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.deletePet = deletePet;

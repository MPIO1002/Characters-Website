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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const auth_1 = __importDefault(require("./auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_config_1 = __importDefault(require("./cloudinary-config"));
const multer_1 = __importDefault(require("multer"));
const redis_client_1 = __importDefault(require("./redis-client"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
const host = "0.0.0.0";
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
redis_client_1.default.connect();
// Lấy chi tiết thông tin nhân vật qua ID
app.get('/heroes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `hero:${id}`;
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const characterResult = yield db_1.default.query('SELECT * FROM "heroes" WHERE id = $1', [parseInt(id)]);
        if (characterResult.rows.length === 0) {
            return res.status(404).json({
                succeed: false,
                message: 'Không tìm thấy tướng'
            });
        }
        const character = characterResult.rows[0];
        const skillResult = yield db_1.default.query('SELECT * FROM "skill" WHERE hero_id = $1', [parseInt(id)]);
        const skills = skillResult.rows;
        const fateResult = yield db_1.default.query('SELECT * FROM "fate" WHERE hero_id = $1', [parseInt(id)]);
        const fates = fateResult.rows;
        const petResult = yield db_1.default.query('SELECT * FROM "pet" WHERE hero_id = $1', [parseInt(id)]);
        const pets = petResult.rows;
        const artifactResult = yield db_1.default.query('SELECT * FROM "artifact" WHERE hero_id = $1', [parseInt(id)]);
        const artifacts = artifactResult.rows;
        const responseData = {
            succeed: true,
            message: 'Character retrieved successfully',
            data: Object.assign(Object.assign({}, character), { skills,
                fates,
                pets,
                artifacts })
        };
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
}));
// Lấy danh sách tất cả các nhân vật
app.get('/heroes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'heroes:all';
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const result = yield db_1.default.query('SELECT * FROM heroes');
        const responseData = {
            succeed: true,
            message: 'Heroes retrieved successfully',
            data: result.rows
        };
        // Lưu vào cache 30 phút
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
}));
// Thêm nhân vật mới
app.post('/heroes', upload.fields([{ name: 'img' }, { name: 'transform' }]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, story, skills, pets, fates, artifacts } = req.body;
    if (!req.files || !('img' in req.files) || !('transform' in req.files)) {
        return res.status(400).json({ succeed: false, message: 'Missing required files' });
    }
    const img = req.files['img'][0];
    const transform = req.files['transform'][0];
    // Parse the JSON strings into objects
    const parsedSkills = JSON.parse(skills);
    const parsedPets = JSON.parse(pets);
    const parsedFates = JSON.parse(fates);
    const parsedArtifacts = JSON.parse(artifacts);
    try {
        const imgUploadResult = yield new Promise((resolve, reject) => {
            cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error)
                    reject(error);
                else if (result)
                    resolve(result);
                else
                    reject(new Error('Upload result is undefined'));
            }).end(img.buffer);
        });
        const transformUploadResult = yield new Promise((resolve, reject) => {
            cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error)
                    reject(error);
                else if (result)
                    resolve(result);
                else
                    reject(new Error('Upload result is undefined'));
            }).end(transform.buffer);
        });
        const heroResult = yield db_1.default.query('INSERT INTO "heroes" (name, img, story, transform) VALUES ($1, $2, $3, $4) RETURNING id', [name, imgUploadResult.secure_url, story, transformUploadResult.secure_url]);
        const heroId = heroResult.rows[0].id;
        for (const skill of parsedSkills) {
            yield db_1.default.query('INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)', [skill.name, skill.star, skill.description, heroId]);
        }
        for (const pet of parsedPets) {
            yield db_1.default.query('INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)', [pet.name, pet.description, heroId]);
        }
        for (const fate of parsedFates) {
            yield db_1.default.query('INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)', [fate.name, fate.description, heroId]);
        }
        for (const artifact of parsedArtifacts) {
            yield db_1.default.query('INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)', [artifact.name, artifact.description, heroId]);
        }
        yield redis_client_1.default.del('heroes:all');
        res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
    }
    catch (err) {
        console.error('Error creating hero:', err);
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Cập nhật thông tin nhân vật
app.put('/heroes/:id', upload.fields([{ name: 'img' }, { name: 'transform' }]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, story, skills, pets, fates, artifacts } = req.body;
    const files = req.files;
    const img = (files === null || files === void 0 ? void 0 : files['img']) ? files['img'][0] : null;
    const transform = (files === null || files === void 0 ? void 0 : files['transform']) ? files['transform'][0] : null;
    // Parse the JSON strings into objects
    const parsedSkills = JSON.parse(skills);
    const parsedPets = JSON.parse(pets);
    const parsedFates = JSON.parse(fates);
    const parsedArtifacts = JSON.parse(artifacts);
    try {
        let imgUploadResult, transformUploadResult;
        if (img) {
            imgUploadResult = yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(img.buffer);
            });
        }
        if (transform) {
            transformUploadResult = yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(transform.buffer);
            });
        }
        yield db_1.default.query('UPDATE "heroes" SET name = $1, img = COALESCE($2, img), story = $3, transform = COALESCE($4, transform) WHERE id = $5', [name, imgUploadResult === null || imgUploadResult === void 0 ? void 0 : imgUploadResult.secure_url, story, transformUploadResult === null || transformUploadResult === void 0 ? void 0 : transformUploadResult.secure_url, parseInt(id)]);
        // Update skills
        for (const skill of parsedSkills) {
            if (!skill.id) {
                yield db_1.default.query('INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)', [skill.name, skill.star, skill.description, id]);
            }
            else {
                yield db_1.default.query('UPDATE "skill" SET name = $1, star = $2, description = $3 WHERE id = $4 AND hero_id = $5', [skill.name, skill.star, skill.description, skill.id, id]);
            }
        }
        // Update pets
        for (const pet of parsedPets) {
            if (!pet.id) {
                yield db_1.default.query('INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)', [pet.name, pet.description, id]);
            }
            else {
                yield db_1.default.query('UPDATE "pet" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [pet.name, pet.description, pet.id, id]);
            }
        }
        // Update fates
        for (const fate of parsedFates) {
            if (!fate.id) {
                yield db_1.default.query('INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)', [fate.name, fate.description, id]);
            }
            else {
                yield db_1.default.query('UPDATE "fate" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [fate.name, fate.description, fate.id, id]);
            }
        }
        // Update artifacts
        for (const artifact of parsedArtifacts) {
            if (!artifact.id) {
                yield db_1.default.query('INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)', [artifact.name, artifact.description, id]);
            }
            else {
                yield db_1.default.query('UPDATE "artifact" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [artifact.name, artifact.description, artifact.id, id]);
            }
        }
        yield redis_client_1.default.del('heroes:all');
        yield redis_client_1.default.del(`hero:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật tướng thành công' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Xóa nhân vật qua ID
app.delete('/heroes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteResult = yield db_1.default.query('DELETE FROM "heroes" WHERE id = $1 RETURNING id', [parseInt(id)]);
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({
                succeed: false,
                message: 'Không tìm thấy tướng để xóa'
            });
        }
        yield redis_client_1.default.del('heroes:all');
        yield redis_client_1.default.del(`hero:${id}`);
        res.status(200).json({
            succeed: true,
            message: 'Xóa tướng thành công'
        });
    }
    catch (err) {
        console.error('Error deleting hero:', err);
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
}));
app.get('/artifact_private', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'artifact_private:all';
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const result = yield db_1.default.query('SELECT * FROM artifact_private');
        const responseData = {
            succeed: true,
            message: 'Lấy danh sách artifact_private thành công',
            data: result.rows
        };
        // Lưu vào cache 30 phút
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Lấy chi tiết artifact_private theo id
app.get('/artifact_private/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `artifact_private:${id}`;
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const result = yield db_1.default.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private' });
        }
        const responseData = { succeed: true, message: 'Lấy artifact_private thành công', data: result.rows[0] };
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Thêm artifact_private mới (upload ảnh lên Cloudinary)
app.post('/artifact_private', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const files = req.files;
    try {
        // Upload từng ảnh nếu có
        let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_1[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_2[0].buffer);
            })).secure_url;
        }
        const result = yield db_1.default.query('INSERT INTO artifact_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url]);
        yield redis_client_1.default.del('artifact_private:all');
        res.status(201).json({ succeed: true, message: 'Thêm artifact_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Cập nhật artifact_private (có thể upload lại ảnh mới)
app.put('/artifact_private/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, description } = req.body;
    const files = req.files;
    try {
        // Lấy artifact_private hiện tại để giữ lại url cũ nếu không upload mới
        const current = yield db_1.default.query('SELECT * FROM artifact_private WHERE id = $1', [id]);
        if (current.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để cập nhật' });
        }
        const artifact = current.rows[0];
        let imgUrl = artifact.img, imgFigure1Url = artifact.img_figure_1, imgFigure2Url = artifact.img_figure_2;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_1[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_2[0].buffer);
            })).secure_url;
        }
        const result = yield db_1.default.query('UPDATE artifact_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]);
        yield redis_client_1.default.del('artifact_private:all');
        yield redis_client_1.default.del(`artifact_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật artifact_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Xóa artifact_private
app.delete('/artifact_private/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query('DELETE FROM artifact_private WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy artifact_private để xóa' });
        }
        yield redis_client_1.default.del('artifact_private:all');
        yield redis_client_1.default.del(`artifact_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Xóa artifact_private thành công' });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Lấy danh sách pet_private
app.get('/pet_private', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'pet_private:all';
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const result = yield db_1.default.query('SELECT * FROM pet_private');
        const responseData = {
            succeed: true,
            message: 'Lấy danh sách pet_private thành công',
            data: result.rows
        };
        // Lưu vào cache 30 phút
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Lấy chi tiết pet_private theo id
app.get('/pet_private/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `pet_private:${id}`;
    try {
        const cached = yield redis_client_1.default.get(cacheKey);
        if (cached) {
            return res.status(200).json(JSON.parse(cached));
        }
        const result = yield db_1.default.query('SELECT * FROM pet_private WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private' });
        }
        const responseData = { succeed: true, message: 'Lấy pet_private thành công', data: result.rows[0] };
        yield redis_client_1.default.setEx(cacheKey, 1800, JSON.stringify(responseData));
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Thêm pet_private mới (upload ảnh lên Cloudinary)
app.post('/pet_private', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description } = req.body;
    const files = req.files;
    try {
        let imgUrl = null, imgFigure1Url = null, imgFigure2Url = null;
        if ((files === null || files === void 0 ? void 0 : files.img) && files.img[0]) {
            imgUrl = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_1[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_2[0].buffer);
            })).secure_url;
        }
        const result = yield db_1.default.query('INSERT INTO pet_private (name, description, img, img_figure_1, img_figure_2) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url]);
        yield redis_client_1.default.del('pet_private:all');
        res.status(201).json({ succeed: true, message: 'Thêm pet_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Cập nhật pet_private (có thể upload lại ảnh mới)
app.put('/pet_private/:id', upload.fields([
    { name: 'img', maxCount: 1 },
    { name: 'img_figure_1', maxCount: 1 },
    { name: 'img_figure_2', maxCount: 1 }
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            imgUrl = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_1) && files.img_figure_1[0]) {
            imgFigure1Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_1[0].buffer);
            })).secure_url;
        }
        if ((files === null || files === void 0 ? void 0 : files.img_figure_2) && files.img_figure_2[0]) {
            imgFigure2Url = (yield new Promise((resolve, reject) => {
                cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else if (result)
                        resolve(result);
                    else
                        reject(new Error('Upload result is undefined'));
                }).end(files.img_figure_2[0].buffer);
            })).secure_url;
        }
        const result = yield db_1.default.query('UPDATE pet_private SET name = $1, description = $2, img = $3, img_figure_1 = $4, img_figure_2 = $5 WHERE id = $6 RETURNING *', [name, description, imgUrl, imgFigure1Url, imgFigure2Url, id]);
        yield redis_client_1.default.del('pet_private:all');
        yield redis_client_1.default.del(`pet_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật pet_private thành công', data: result.rows[0] });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Xóa pet_private
app.delete('/pet_private/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield db_1.default.query('DELETE FROM pet_private WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ succeed: false, message: 'Không tìm thấy pet_private để xóa' });
        }
        yield redis_client_1.default.del('pet_private:all');
        yield redis_client_1.default.del(`pet_private:${id}`);
        res.status(200).json({ succeed: true, message: 'Xóa pet_private thành công' });
    }
    catch (err) {
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
app.use('/auth', auth_1.default);
app.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});

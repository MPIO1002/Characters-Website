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
exports.deleteHero = exports.updateHero = exports.createHero = exports.getHeroById = exports.getHeroes = void 0;
const db_1 = __importDefault(require("../db"));
const uploadService_1 = require("../services/uploadService");
const cacheService_1 = require("../services/cacheService");
const getHeroes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = 'heroes:all';
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }
        const result = yield db_1.default.query('SELECT * FROM heroes');
        const responseData = {
            succeed: true,
            message: 'Heroes retrieved successfully',
            data: result.rows
        };
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
});
exports.getHeroes = getHeroes;
const getHeroById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const cacheKey = `hero:${id}`;
    try {
        const cached = yield (0, cacheService_1.getCachedData)(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
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
        yield (0, cacheService_1.setCachedData)(cacheKey, responseData);
        res.status(200).json(responseData);
    }
    catch (err) {
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
});
exports.getHeroById = getHeroById;
const createHero = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, story, skills, pets, fates, artifacts } = req.body;
    if (!req.files || !('img' in req.files) || !('transform' in req.files)) {
        return res.status(400).json({ succeed: false, message: 'Missing required files' });
    }
    const img = req.files['img'][0];
    const transform = req.files['transform'][0];
    const parsedSkills = JSON.parse(skills);
    const parsedPets = JSON.parse(pets);
    const parsedFates = JSON.parse(fates);
    const parsedArtifacts = JSON.parse(artifacts);
    try {
        const imgUploadResult = yield (0, uploadService_1.uploadToCloudinary)(img.buffer);
        const transformUploadResult = yield (0, uploadService_1.uploadToCloudinary)(transform.buffer);
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
        yield (0, cacheService_1.deleteCachedData)('heroes:all');
        res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
    }
    catch (err) {
        console.error('Error creating hero:', err);
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.createHero = createHero;
const updateHero = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, story, skills, pets, fates, artifacts } = req.body;
    const files = req.files;
    const img = (files === null || files === void 0 ? void 0 : files['img']) ? files['img'][0] : null;
    const transform = (files === null || files === void 0 ? void 0 : files['transform']) ? files['transform'][0] : null;
    const parsedSkills = JSON.parse(skills);
    const parsedPets = JSON.parse(pets);
    const parsedFates = JSON.parse(fates);
    const parsedArtifacts = JSON.parse(artifacts);
    try {
        let imgUploadResult, transformUploadResult;
        if (img) {
            imgUploadResult = yield (0, uploadService_1.uploadToCloudinary)(img.buffer);
        }
        if (transform) {
            transformUploadResult = yield (0, uploadService_1.uploadToCloudinary)(transform.buffer);
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
        yield (0, cacheService_1.deleteCachedData)('heroes:all');
        yield (0, cacheService_1.deleteCachedData)(`hero:${id}`);
        res.status(200).json({ succeed: true, message: 'Cập nhật tướng thành công' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ succeed: false, message: err.message });
    }
});
exports.updateHero = updateHero;
const deleteHero = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteResult = yield db_1.default.query('DELETE FROM "heroes" WHERE id = $1 RETURNING id', [parseInt(id)]);
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({
                succeed: false,
                message: 'Không tìm thấy tướng để xóa'
            });
        }
        yield (0, cacheService_1.deleteCachedData)('heroes:all');
        yield (0, cacheService_1.deleteCachedData)(`hero:${id}`);
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
});
exports.deleteHero = deleteHero;

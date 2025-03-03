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
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Lấy chi tiết thông tin nhân vật qua ID
app.get('/heroes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
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
        res.status(200).json({
            succeed: true,
            message: 'Character retrieved successfully',
            data: Object.assign(Object.assign({}, character), { skills,
                fates,
                pets,
                artifacts })
        });
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
    try {
        const result = yield db_1.default.query('SELECT * FROM heroes');
        res.status(200).json({
            succeed: true,
            message: 'Heroes retrieved successfully',
            data: result.rows
        });
    }
    catch (err) {
        res.status(500).json({
            succeed: false,
            message: err.message
        });
    }
}));
// Thêm nhân vật mới
app.post('/heroes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, img, story, transform, skills, pets, fates, artifacts } = req.body;
    try {
        const heroResult = yield db_1.default.query('INSERT INTO "heroes" (name, img, story, transform) VALUES ($1, $2, $3, $4) RETURNING id', [name, img, story, transform]);
        const heroId = heroResult.rows[0].id;
        console.log(`Hero created with id: ${heroId}`);
        for (const skill of skills) {
            console.log(`Inserting skill: ${JSON.stringify(skill)}`);
            yield db_1.default.query('INSERT INTO "skill" (name, star, description, hero_id) VALUES ($1, $2, $3, $4)', [skill.name, skill.star, skill.description, heroId]);
        }
        for (const pet of pets) {
            console.log(`Inserting pet: ${JSON.stringify(pet)}`);
            yield db_1.default.query('INSERT INTO "pet" (name, description, hero_id) VALUES ($1, $2, $3)', [pet.name, pet.description, heroId]);
        }
        for (const fate of fates) {
            console.log(`Inserting fate: ${JSON.stringify(fate)}`);
            yield db_1.default.query('INSERT INTO "fate" (name, description, hero_id) VALUES ($1, $2, $3)', [fate.name, fate.description, heroId]);
        }
        for (const artifact of artifacts) {
            console.log(`Inserting artifact: ${JSON.stringify(artifact)}`);
            yield db_1.default.query('INSERT INTO "artifact" (name, description, hero_id) VALUES ($1, $2, $3)', [artifact.name, artifact.description, heroId]);
        }
        res.status(201).json({ succeed: true, message: 'Tạo tướng mới thành công', heroId });
    }
    catch (err) {
        console.error('Error creating hero:', err);
        res.status(500).json({ succeed: false, message: err.message });
    }
}));
// Cập nhật thông tin nhân vật
app.put('/heroes/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, img, story, transform, skills, pets, fates, artifacts } = req.body;
    try {
        yield db_1.default.query('UPDATE "heroes" SET name = $1, img = $2, story = $3, transform = $4 WHERE id = $5', [name, img, story, transform, parseInt(id)]);
        // Update skills
        for (const skill of skills) {
            if (!skill.id) {
                continue;
            }
            console.log(`Updating skill with id: ${skill.id} for hero_id: ${id}`);
            yield db_1.default.query('UPDATE "skill" SET name = $1, star = $2, description = $3 WHERE id = $4 AND hero_id = $5', [skill.name, skill.star, skill.description, skill.id, id]);
        }
        // Update pets
        for (const pet of pets) {
            if (!pet.id) {
                continue;
            }
            yield db_1.default.query('UPDATE "pet" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [pet.name, pet.description, pet.id, id]);
        }
        // Update fates
        for (const fate of fates) {
            if (!fate.id) {
                continue;
            }
            yield db_1.default.query('UPDATE "fate" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [fate.name, fate.description, fate.id, id]);
        }
        // Update artifacts
        for (const artifact of artifacts) {
            if (!artifact.id) {
                continue;
            }
            yield db_1.default.query('UPDATE "artifact" SET name = $1, description = $2 WHERE id = $3 AND hero_id = $4', [artifact.name, artifact.description, artifact.id, id]);
        }
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
app.use('/auth', auth_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

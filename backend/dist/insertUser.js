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
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("./db"));
const insertUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const username = 'admin';
    const password = 'GGOadminMHGH2025';
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    yield db_1.default.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    console.log('User inserted');
});
insertUser().catch(err => console.error(err));

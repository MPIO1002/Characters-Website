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
exports.deleteCachedData = exports.setCachedData = exports.getCachedData = void 0;
const redis_client_1 = __importDefault(require("../redis-client"));
const getCachedData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cached = yield redis_client_1.default.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
});
exports.getCachedData = getCachedData;
const setCachedData = (key_1, data_1, ...args_1) => __awaiter(void 0, [key_1, data_1, ...args_1], void 0, function* (key, data, ttl = 1800) {
    try {
        yield redis_client_1.default.setEx(key, ttl, JSON.stringify(data));
    }
    catch (error) {
        console.error('Cache set error:', error);
    }
});
exports.setCachedData = setCachedData;
const deleteCachedData = (key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_client_1.default.del(key);
    }
    catch (error) {
        console.error('Cache delete error:', error);
    }
});
exports.deleteCachedData = deleteCachedData;

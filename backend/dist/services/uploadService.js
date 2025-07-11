"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_config_1 = __importDefault(require("../cloudinary-config"));
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary_config_1.default.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error)
                reject(error);
            else if (result)
                resolve(result);
            else
                reject(new Error('Upload result is undefined'));
        }).end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;

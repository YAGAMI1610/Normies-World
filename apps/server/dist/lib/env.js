"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const rawEnv = process.env;
exports.env = {
    ...rawEnv,
    PORT: rawEnv.PORT || '4000',
    NODE_ENV: rawEnv.NODE_ENV || 'development',
};
exports.default = exports.env;

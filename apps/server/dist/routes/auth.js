"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuth = optionalAuth;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.whaleAddress = payload.whaleAddress;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
function optionalAuth(req, _res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.userId = payload.userId;
            req.whaleAddress = payload.whaleAddress;
        }
        catch { /* ignore */ }
    }
    next();
}
exports.default = router;

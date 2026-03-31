"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const authMiddleware = (req, res, next) => {
    const jwtToken = req.cookies.jwt;
    if (!jwtToken) {
        res.status(401).json({
            message: "User not verified"
        });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({
            message: "Server configuration error"
        });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(jwtToken, secret);
        if (typeof decodedToken !== "string") {
            res.status(401).json({ message: "User not verified" });
            return;
        }
        req.userId = decodedToken;
        next();
    }
    catch {
        res.status(401).json({
            message: "User not verified"
        });
    }
};
exports.authMiddleware = authMiddleware;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const guestMiddleware = (req, res, next) => {
    const jwtToken = req.cookies.jwt;
    const guestToken = req.cookies.guest_session;
    const token = jwtToken || guestToken;
    if (!token) {
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
        const decodedToken = jsonwebtoken_1.default.verify(token, secret);
        if (typeof decodedToken !== "string") {
            res.status(401).json({ message: "User not verified" });
            return;
        }
        req.userId = decodedToken;
        req.isGuest = !jwtToken || decodedToken.startsWith("guest:");
        next();
    }
    catch {
        res.status(401).json({
            message: "User not verified"
        });
    }
};
exports.guestMiddleware = guestMiddleware;

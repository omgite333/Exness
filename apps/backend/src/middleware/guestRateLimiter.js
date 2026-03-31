"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestTradeLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.guestTradeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    skip: (req) => {
        return !req.isGuest;
    },
    message: {
        message: "Too many requests.Please sign in for unlimted trading"
    },
});

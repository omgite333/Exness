"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = exports.OpenTradesFetchMsg = exports.GetUserBalMsg = exports.GetAssetBalMsg = exports.TradeCloseMsg = exports.TradeOpenMsg = exports.PriceUpdateMsg = exports.UserAuthMsg = exports.BaseMsg = exports.closeOrderSchema = exports.createOrderSchema = exports.authBodySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.authBodySchema = zod_1.default.object({
    email: zod_1.default.email(),
});
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
exports.createOrderSchema = zod_1.default.object({
    asset: zod_1.default.string().min(1),
    type: zod_1.default.enum(["long", "short"]),
    quantity: zod_1.default.number().positive().max(1e12),
    leverage: zod_1.default.number().int().min(1).max(100),
    slippage: zod_1.default.number().min(0).max(100),
    openPrice: zod_1.default.number().positive(),
    decimal: zod_1.default.number().int().min(0).max(8),
});
exports.closeOrderSchema = zod_1.default.object({
    orderId: zod_1.default.string().min(1).max(64).regex(UUID_REGEX),
});
exports.BaseMsg = zod_1.default.object({ reqId: zod_1.default.string(), type: zod_1.default.string() });
exports.UserAuthMsg = exports.BaseMsg.extend({
    type: zod_1.default.enum(["user-signup", "user-signin"]),
    user: zod_1.default.string(),
});
exports.PriceUpdateMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("price-update"),
    tradePrices: zod_1.default.string(),
});
exports.TradeOpenMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("trade-open"),
    tradeInfo: zod_1.default.string(),
    userId: zod_1.default.string(),
});
exports.TradeCloseMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("trade-close"),
    orderId: zod_1.default.string(),
    userId: zod_1.default.string(),
});
exports.GetAssetBalMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("get-asset-bal"),
    userId: zod_1.default.string(),
});
exports.GetUserBalMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("get-user-bal"),
    userId: zod_1.default.string(),
});
exports.OpenTradesFetchMsg = exports.BaseMsg.extend({
    type: zod_1.default.literal("open-trades-fetch"),
    userId: zod_1.default.string(),
});
exports.MessageSchema = zod_1.default.discriminatedUnion("type", [
    exports.UserAuthMsg,
    exports.PriceUpdateMsg,
    exports.TradeOpenMsg,
    exports.TradeCloseMsg,
    exports.GetAssetBalMsg,
    exports.GetUserBalMsg,
    exports.OpenTradesFetchMsg,
]);

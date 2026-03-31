"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTradeFailure = logTradeFailure;
exports.mapTradeErrorToUserMessage = mapTradeErrorToUserMessage;

function normailzeReason(err) {
    if (typeof err === "string") return err;
    if (err instanceof Error) return err.message;
    return "";
}

function mapTradeErrorToUserMessage(err) {
    const reason = normailzeReason(err).trim();
    const lower = reason.toLowerCase();
    if (lower.includes("response not got within time")) {
        return "Trade is taking longer than expected. Please try again.";
    }
    if (lower.includes("slippage")) {
        return "Price moved too quickly. Please retry (or increase slippage).";
    }
    if (lower.includes("enough balance")) {
        return "Insufficient balance to open this trade.";
    }
    if (lower.includes("asset") && lower.includes("not")) {
        return "This asset is not supported.";
    }
    if (lower.includes("order does")) {
        return "Trade not found or already closed.";
    }
    if (lower.includes("user does")) {
        return "Please sign in again and retry.";
    }
    if (lower.includes("failed to save trade")) {
        return "We couldn't complete that trade right now. Please try again.";
    }
    if (lower.includes("request failed")) {
        return "Trade failed. Please try again.";
    }
    return "Trade failed. Please try again.";
}

function logTradeFailure(context, err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error(`\n  ❌ Trade Error\n  Context: ${context}\n  Message: ${message}\n  Time: ${new Date().toISOString()}\n  `);
}

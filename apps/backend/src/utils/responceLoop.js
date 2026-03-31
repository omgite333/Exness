"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseLoopObj = exports.ResponseLoop = void 0;
const queue_1 = require("@repo/redis/queue");
class ResponseLoop {
    constructor() {
        this.idResponseMap = {};
    }
    start() {
        this.runLoop();
    }
    safeSettle(gotId, settle) {
        const entry = this.idResponseMap[gotId];
        if (!entry)
            return false;
        clearTimeout(entry.timeoutId);
        delete this.idResponseMap[gotId];
        settle(entry);
        return true;
    }
    async runLoop() {
        let lastId = "$";
        while (1) {
            try {
                const res = await queue_1.engineResponsePuller.xRead({
                    key: "stream:engine:response",
                    id: lastId,
                }, { BLOCK: 5000, COUNT: 1 });
                if (!res?.[0]?.messages?.[0]?.message)
                    continue;
                const entry = res[0].messages[0];
                lastId = entry.id;
                const msg = entry.message;
                const reqType = msg.type;
                const gotId = msg.reqId;
                if (!gotId)
                    continue;
                switch (reqType) {
                    case "user-signup/in-ack":
                        this.safeSettle(gotId, (e) => e.resolve());
                        break;
                    case "request-failed":
                    case "trade-open-err":
                    case "trade-close-err":
                    case "get-user-bal-err": {
                        let message = "Request failed";
                        try {
                            const raw = msg.response;
                            const parsed = raw
                                ? JSON.parse(raw)
                                : null;
                            if (parsed?.message)
                                message = parsed.message;
                        }
                        catch { }
                        this.safeSettle(gotId, (e) => e.reject(message));
                        break;
                    }
                    case "trade-open-ack": {
                        try {
                            const raw = res[0]?.messages[0]?.message.response;
                            const parsed = raw
                                ? JSON.parse(raw)
                                : null;
                            if (parsed?.order !== undefined && parsed?.orderId !== undefined) {
                                this.safeSettle(gotId, (e) => e.resolve(JSON.stringify({
                                    order: parsed.order,
                                    orderId: parsed.orderId,
                                    userBal: parsed.userBal,
                                    openOrders: parsed.openOrders,
                                })));
                            }
                            else {
                                this.safeSettle(gotId, (e) => e.reject("Invalid response shape"));
                            }
                        }
                        catch {
                            this.safeSettle(gotId, (e) => e.reject("Invalid response"));
                        }
                        break;
                    }
                    case "trade-close-ack": {
                        try {
                            const raw = res[0]?.messages[0]?.message.response;
                            const parsed = raw
                                ? JSON.parse(raw)
                                : null;
                            if (parsed !== null && parsed !== undefined) {
                                this.safeSettle(gotId, (e) => e.resolve(JSON.stringify({
                                    userBal: parsed.userBal,
                                    orderId: parsed.orderId,
                                    openOrders: parsed.openOrders,
                                })));
                            }
                            else {
                                this.safeSettle(gotId, (e) => e.reject("Invalid response shape"));
                            }
                        }
                        catch {
                            this.safeSettle(gotId, (e) => e.reject("Invalid response"));
                        }
                        break;
                    }
                    case "get-user-bal-ack": {
                        try {
                            const raw = res[0]?.messages[0]?.message.response;
                            const parsed = raw
                                ? JSON.parse(raw)
                                : null;
                            if (parsed?.userBal !== undefined) {
                                this.safeSettle(gotId, (e) => e.resolve(parsed.userBal));
                            }
                            else {
                                this.safeSettle(gotId, (e) => e.reject("Invalid response shape"));
                            }
                        }
                        catch {
                            this.safeSettle(gotId, (e) => e.reject("Invalid response"));
                        }
                        break;
                    }
                    case "open-trades-fetch-ack": {
                        try {
                            const raw = res[0]?.messages[0]?.message.response;
                            const parsed = raw
                                ? JSON.parse(raw)
                                : null;
                            if (parsed?.trades !== undefined) {
                                this.safeSettle(gotId, (e) => e.resolve(parsed.trades));
                            }
                            else {
                                this.safeSettle(gotId, (e) => e.reject("Invalid response shape"));
                            }
                        }
                        catch {
                            this.safeSettle(gotId, (e) => e.reject("Invalid response"));
                        }
                        break;
                    }
                    default:
                        // Unknown message type — skip silently
                        break;
                }
            }
            catch (err) {
                console.error("\n\nResponseLoop error", err);
            }
        }
    }
    async waitForResponse(id) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                const entry = this.idResponseMap[id];
                if (entry) {
                    delete this.idResponseMap[id];
                    reject("Response not got within time");
                }
            }, 3500);
            this.idResponseMap[id] = { resolve, reject, timeoutId };
        });
    }
}
exports.ResponseLoop = ResponseLoop;
exports.responseLoopObj = new ResponseLoop();

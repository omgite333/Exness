"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.db = void 0;
var client_js_1 = require("./db/client.js");
Object.defineProperty(exports, "db", { enumerable: true, get: function () { return client_js_1.db; } });
Object.defineProperty(exports, "schema", { enumerable: true, get: function () { return client_js_1.schema; } });

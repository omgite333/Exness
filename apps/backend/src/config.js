"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBackendConfig = loadBackendConfig;
function getRequiredEnv(name) {
    const value = process.env[name];
    if (value === undefined || value === "") {
        throw new Error(`\n\nMising required enviroment variable: ${name}`);
    }
    return value;
}
function loadBackendConfig() {
    return {
        CORS_ORIGIN: getRequiredEnv("CORS_ORIGIN"),
        HTTP_PORT: parseInt(getRequiredEnv("HTTP_PORT")),
        API_BASE_URL: getRequiredEnv("API_BASE_URL"),
        JWT_SECRET: getRequiredEnv("JWT_SECRET"),
        DATABASE_URL: getRequiredEnv("DATABASE_URL"),
    };
}

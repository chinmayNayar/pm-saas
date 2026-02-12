"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const routes_1 = require("./routes");
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const stripeWebhook_1 = require("./modules/billing/stripeWebhook");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: "*", credentials: true }));
    // Stripe webhook needs the raw body; mount before JSON body parser
    app.post("/stripe/webhook", express_1.default.raw({ type: "application/json" }), stripeWebhook_1.stripeWebhookHandler);
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)("combined", {
        stream: {
            write: (message) => logger_1.logger.http?.(message.trim()) || logger_1.logger.info(message.trim())
        }
    }));
    app.use(requestLogger_1.requestLogger);
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", env: env_1.env.nodeEnv });
    });
    app.use("/api/v1", routes_1.apiRouter);
    app.use(notFoundHandler_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}

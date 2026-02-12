import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { requestLogger } from "./middleware/requestLogger";
import { stripeWebhookHandler } from "./modules/billing/stripeWebhook";

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  // CORS: allow browser to send cookies from the Next.js app (http://localhost:3000)
  // IMPORTANT: origin must be explicit when credentials: true is used.
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );
  // Stripe webhook needs the raw body; mount before JSON body parser
  app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhookHandler
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    morgan("combined", {
      stream: {
        write: (message: string) =>
          (logger as any).http?.(message.trim()) || logger.info(message.trim())
      }
    })
  );

  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", env: env.nodeEnv });
  });

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}


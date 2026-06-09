// apps/backend/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

import { oauthRouter, webhookRouter } from "./integrations/ghl/index.js";
app.use("/api/integrations/ghl", oauthRouter);
app.use("/api/integrations/ghl", webhookRouter);

// Operator Router
import operatorRouter from "./routes/operator.js";
app.use("/api/operator", operatorRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(4000, () => {
  console.log("Backend running at http://localhost:4000");
});
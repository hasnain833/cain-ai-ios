import { Router } from "express";
import { prisma } from "database";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
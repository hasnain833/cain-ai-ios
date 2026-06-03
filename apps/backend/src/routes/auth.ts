import { Router } from "express";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/session", authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;

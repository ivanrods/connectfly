import { Router } from "express";
import {
  deleteUser,
  getUser,
  listUsers,
  updateUser,
  updateUserAvatar,
} from "../controllers/user-controller.js";
import { authenticateToken } from "../middlewares/authenticate-token.js";
import upload from "../config/upload.js";

const router = Router();

router.get("/", authenticateToken, listUsers);
router.get("/:id", authenticateToken, getUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);
router.patch(
  "/:id/avatar",
  authenticateToken,
  upload.single("avatar"),
  updateUserAvatar,
);

export default router;

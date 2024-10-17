import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// protected route example
router.get("/profile", ensureAuthenticated, (req, res) => {
  res.send("Profile page");
});

export default router;

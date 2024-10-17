import express from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/userController.js";
import { ensureAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/check-auth", (req, res) => {
  console.log("Checking authentication");
  if (req.isAuthenticated()) {
    console.log("User is authenticated");
    res.json({ isAuthenticated: true });
  } else {
    console.log("User is not authenticated");
    res.json({ isAuthenticated: false });
  }
});

export default router;

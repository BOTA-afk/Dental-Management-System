import express from "express";
import { createAdmin,login,createAccount,getStaff } from "../controllers/adminController.js";
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/register", createAdmin);
router.post("/login", login);
router.post("/create-account", verifyToken, isAdmin, createAccount);
router.get('/staff', verifyToken, isAdmin, getStaff);
export default router;
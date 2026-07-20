import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, phoneNumber, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Create User (password will be hashed by User schema pre-save hook)
    const newUser = new User({
      fullName,
      email,
      phoneNumber: phoneNumber || phone || '',
      password,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
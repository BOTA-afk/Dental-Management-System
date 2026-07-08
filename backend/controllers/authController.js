import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
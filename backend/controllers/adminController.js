import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import User from "../models/User.js";


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, check the Admin collection
    let account = await Admin.findOne({ email });
    let isSystemAdmin = true;

    // If not found in Admin, check the User collection
    if (!account) {
      account = await User.findOne({ email });
      isSystemAdmin = false;
    }

    // Verify account existence and compare hashed password
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Determine the role for the token
    const tokenRole = isSystemAdmin
      ? (account.role === 'admin' ? 'system_admin' : account.role)
      : account.role; // e.g., 'dentist', 'assistant'

    // Generate Token
    const token = jwt.sign(
      { id: account._id, role: tokenRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        role: tokenRole
      },
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create a new instance of the Admin model
    // Note: The password hashing is handled by the pre-save hook in your model
    const newAdmin = new Admin({
      fullName,
      email,
      password,
    });

    // Save the data into the DB
    await newAdmin.save();

    res.status(201).json({ 
      message: "Admin account created successfully",
      adminId: newAdmin._id 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createAccount = async (req, res) => {
  const { fullName, email, phoneNumber, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role
    });

    res.status(201).json({ message: "Account created successfully", userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getStaff = async (_req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["dentist", "assistant"] } })
      .select("fullName email phoneNumber role createdAt")
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
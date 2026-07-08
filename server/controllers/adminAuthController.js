import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_secret_gift_movers_key';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'delivery', 'support'];

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied: not an admin account' });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({ message: `Access denied: account is ${user.accountStatus}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestAdminAccess = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!adminRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role requested' });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate a temporary secure password (they will reset it when approved)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    // Create user with pending_approval status
    const user = await dbService.createUser({
      name,
      email,
      password: tempPassword,
      role,
      accountStatus: 'pending_approval' // Ensure DB saves this
    });
    
    // Explicitly update accountStatus since dbService.createUser might not handle new fields natively yet
    // if it uses a generic save, it should be fine. But just in case:
    await User.findByIdAndUpdate(user._id, { accountStatus: 'pending_approval' });

    res.status(201).json({
      message: 'Access request submitted successfully. Awaiting superadmin approval.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

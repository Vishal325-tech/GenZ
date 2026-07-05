import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/dbService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'luxury_secret_gift_movers_key';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const existingUser = await dbService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Set first user as admin for easy testing, otherwise customer
    const allUsers = await dbService.findCustomers();
    const isFirstUser = allUsers.length === 0;
    const role = isFirstUser ? 'admin' : 'customer';

    const user = await dbService.createUser({
      name,
      email,
      password,
      phone: phone || '',
      role
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
      phone: user.phone,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password
    const { password, ...userWithoutPassword } = JSON.parse(JSON.stringify(user));
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, phone, addressBook, savedCards } = req.body;
    
    const updatedData = {};
    if (name) updatedData.name = name;
    if (phone) updatedData.phone = phone;
    if (addressBook) updatedData.addressBook = addressBook;
    if (savedCards) updatedData.savedCards = savedCards;

    const updatedUser = await dbService.updateUser(req.user.id, updatedData);
    
    const { password, ...userWithoutPassword } = JSON.parse(JSON.stringify(updatedUser));
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestOTP = async (req, res) => {
  const { email } = req.body;
  // Send mock OTP code 123456
  res.json({ message: `A secure verification code has been simulated to ${email}. Use OTP code '123456' to proceed.` });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (otp === '123456') {
    let user = await dbService.findUserByEmail(email);
    if (!user) {
      // Auto-register OTP logins for simple demo flows
      user = await dbService.createUser({
        name: email.split('@')[0],
        email,
        password: 'otp_auto_generated_pass',
        role: 'customer'
      });
    }
    const token = generateToken(user._id, user.role);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } else {
    res.status(400).json({ message: 'Invalid or expired verification code' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  res.json({ message: `Password reset instructions have been dispatched to ${email}.` });
};

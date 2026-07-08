import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';

const createSuperAdmin = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node createSuperAdmin.js <name> <email> <password>');
    console.log('Example: node createSuperAdmin.js "Vishal" vishal@genz.com mysecurepassword');
    process.exit(1);
  }

  const [name, email, password] = args;

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      console.log('Updating to superadmin...');
      existingUser.role = 'superadmin';
      existingUser.accountStatus = 'active';
      await existingUser.save();
      console.log(`Successfully upgraded ${email} to superadmin!`);
    } else {
      console.log(`Creating new superadmin account for ${email}...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 'superadmin',
        accountStatus: 'active'
      });
      
      await newUser.save();
      console.log(`Successfully created superadmin account for ${email}!`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
    process.exit(0);
  }
};

createSuperAdmin();

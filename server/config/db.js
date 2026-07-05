import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMongoConnected = false;

export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('⚠️ No MONGODB_URI found in environment variables. Falling back to local JSON database storage.');
    isMongoConnected = false;
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
    isMongoConnected = true;
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.log('⚠️ Falling back to local JSON database storage.');
    isMongoConnected = false;
    return false;
  }
}

export function checkMongoConnected() {
  return isMongoConnected;
}

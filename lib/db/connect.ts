import mongoose from 'mongoose';
import { env } from '@/lib/config/env';

const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      ssl: true,
      tls: true,
      tlsAllowInvalidCertificates: true, // Only for development
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
} 
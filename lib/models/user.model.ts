import mongoose, { Document, Model, Schema } from 'mongoose';
import { z } from 'zod';

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']).default('user'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { 
      type: String, 
      required: true,
      trim: true,
    },
    password: { 
      type: String, 
      required: true,
      minlength: 8,
    },
    role: { 
      type: String, 
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes for faster queries
userSchema.index({ email: 1 });

export const UserModel: Model<UserDocument> = 
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema); 
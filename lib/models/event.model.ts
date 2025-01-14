import mongoose, { Document, Model, Schema } from 'mongoose';
import { z } from 'zod';

export const EventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  maxAttendees: z.number().int().positive('Maximum attendees must be positive'),
  currentAttendees: z.number().int().min(0),
  organizer: z.string(),
  attendees: z.array(z.string()),
  status: z.enum(['draft', 'published', 'cancelled']).default('published'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Event = z.infer<typeof EventSchema>;

interface EventDocument extends Event, Document {}

const eventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    maxAttendees: { type: Number, required: true },
    currentAttendees: { type: Number, default: 0 },
    organizer: { type: String, required: true },
    attendees: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled'],
      default: 'published',
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
eventSchema.index({ organizer: 1, date: 1 });
eventSchema.index({ status: 1, date: 1 });

export const EventModel: Model<EventDocument> = 
  mongoose.models.Event || mongoose.model<EventDocument>('Event', eventSchema); 
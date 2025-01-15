import { Metadata } from 'next';
import { CreateEventForm } from '@/components/events/create-event-form';

export const metadata: Metadata = {
  title: 'Create Event - EventEase',
  description: 'Create a new event on EventEase',
};

export default async function CreateEventPage() {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Event</h2>
        <p className="text-muted-foreground">
          Make changes to your event here.
        </p>
      </div>

        <CreateEventForm />
    
    </div>
  );
} 
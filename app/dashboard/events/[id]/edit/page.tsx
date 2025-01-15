import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/connect';
import { EventModel } from '@/lib/models/event.model';
import { UpdateEventForm } from '@/components/events/update-event-form';

async function getEvent(id: string) {
  await connectDB();
  const event = await EventModel.findById(id).lean();
  
  if (!event) {
    notFound();
  }

  return JSON.parse(JSON.stringify(event));
}

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
        <p className="text-muted-foreground">
          Make changes to your event here.
        </p>
      </div>
      <UpdateEventForm event={event} />
    </div>
  );
} 
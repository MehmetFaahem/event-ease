'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const updateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date(),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  maxAttendees: z.number().int().min(1, 'Must allow at least 1 attendee'),
  status: z.enum(['draft', 'published']),
});

type UpdateEventFormValues = z.infer<typeof updateEventSchema>;

interface UpdateEventFormProps {
  event: any;
}

export function UpdateEventForm({ event }: UpdateEventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      location: event.location,
      maxAttendees: event.maxAttendees,
      status: event.status,
    },
  });

  async function onSubmit(data: UpdateEventFormValues) {
    setIsLoading(true);
    try {
      const formattedData = {
        ...data,
        date: data.date.toISOString(),
      };

      const response = await fetch(`/api/events/${event._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });

      router.push('/dashboard/events');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update event',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter event title"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Choose a clear and descriptive title for your event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter event description"
                  className="min-h-[120px] resize-y"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide details about your event. Include important information like schedule, what to bring, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Select when your event will take place.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem className="mt-[-10px]">
                <FormLabel>Maximum Attendees</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Set the maximum number of attendees.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter event location"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Specify where your event will be held.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  disabled={isLoading}
                  {...field}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </FormControl>
              <FormDescription>
                Draft events are only visible to you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Event'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 
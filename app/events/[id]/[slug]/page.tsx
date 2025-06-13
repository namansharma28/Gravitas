import StructuredData from '@/components/seo/structured-data';
import { Event } from '@/types/event';

async function getEvent(id: string): Promise<Event | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/events/${id}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventPage({ params }: { params: { id: string; slug: string } }) {
  const event = await getEvent(params.id);

  if (!event) {
    return null;
  }

  return (
    <>
      <StructuredData
        type="event"
        data={{
          title: event.title,
          description: event.description,
          slug: event.id,
          startDate: new Date(`${event.date}T${event.time}`).toISOString(),
          endDate: new Date(`${event.date}T${event.time}`).toISOString(),
          location: event.location,
          image: event.image,
          organizer: {
            name: event.community.name,
            handle: event.community.handle,
          },
        }}
      />
      {/* ... rest of the existing JSX ... */}
    </>
  );
} 
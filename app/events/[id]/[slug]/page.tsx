import StructuredData from '@/components/seo/structured-data';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  image?: string;
  community: {
    name: string;
    handle: string;
    avatar: string;
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  // ... existing code ...

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
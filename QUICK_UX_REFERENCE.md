# Quick UX Reference Guide

## 🚀 Quick Copy-Paste Examples

### 1. Loading Skeleton
```tsx
import { EventCardSkeleton } from "@/components/skeletons/event-card-skeleton";

if (isLoading) {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)}
    </div>
  );
}
```

### 2. Empty State
```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";

<EmptyState
  icon={CalendarDays}
  title="No events found"
  description="Get started by creating your first event"
  actionLabel="Create Event"
  actionHref="/events/create"
/>
```

### 3. Error State
```tsx
import { ErrorState } from "@/components/ui/error-state";

<ErrorState
  title="Failed to load"
  message={error}
  onRetry={() => {
    setError(null);
    fetchData();
  }}
/>
```

### 4. Enhanced Toast
```tsx
import { useEnhancedToast } from "@/components/ui/enhanced-toast";

const { showToast } = useEnhancedToast();

// Success
showToast({
  title: "Success!",
  description: "Your changes have been saved",
  type: "success",
});

// Error
showToast({
  title: "Error",
  description: "Something went wrong",
  type: "error",
});

// Loading
showToast({
  title: "Processing...",
  type: "loading",
});
```

### 5. Success Animation
```tsx
import { SuccessAnimation } from "@/components/ui/success-animation";

<SuccessAnimation message="Created successfully!" size="lg" />
```

## 📦 Available Skeletons

- `EventCardSkeleton` - Vertical event card
- `EventCardSkeletonHorizontal` - Horizontal event card
- `CommunityCardSkeleton` - Community card
- `FeedCardSkeleton` - Feed item
- `Skeleton` - Base skeleton (custom sizes)

## 🎨 Toast Types

- `success` - ✓ Green, positive actions
- `error` - ✕ Red, failures
- `warning` - ⚠ Yellow, cautions
- `info` - ℹ Blue, information
- `loading` - ⟳ Blue, processing (infinite)

## 📏 Success Animation Sizes

- `sm` - Small (48px)
- `md` - Medium (64px) - default
- `lg` - Large (96px)

## ✅ Pages Already Enhanced

1. ✅ Explore page
2. ✅ Home/Feed page
3. ✅ Calendar page
4. ✅ Community page
5. ✅ Settings page

## 🎯 Common Pattern

```tsx
// 1. Add state
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const { showToast } = useEnhancedToast();

// 2. Loading
if (isLoading) return <Skeleton />;

// 3. Error
if (error) return <ErrorState message={error} onRetry={fetch} />;

// 4. Empty
if (items.length === 0) return <EmptyState />;

// 5. Success feedback
showToast({ title: "Done!", type: "success" });
```

## 📝 Full Documentation

See `UX_FINAL_SUMMARY.md` for complete details.

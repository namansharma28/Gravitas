import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardContent className="p-4 pt-3">
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventCardSkeletonHorizontal() {
  return (
    <Card className="transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="aspect-video w-32 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

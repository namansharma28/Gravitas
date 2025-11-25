import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Skeleton className="aspect-video w-full" />
        <div className="absolute -bottom-6 left-4">
          <Skeleton className="h-12 w-12 rounded-full border-4 border-background" />
        </div>
      </div>

      <CardContent className="pt-8">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>

        <Skeleton className="h-10 w-full mb-4" />

        <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

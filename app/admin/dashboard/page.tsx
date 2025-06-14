"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Info
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/layout";

interface DashboardStats {
  totalUsers: number;
  totalCommunities: number;
  totalEvents: number;
  totalRegistrations: number;
  recentUsers: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
  monthlyGrowth: {
    month: string;
    users: number;
  }[];
}

interface CommunityStats {
  totalCommunities: number;
  pendingCommunities: number;
  approvedCommunities: number;
  rejectedCommunities: number;
  recentCommunities: {
    id: string;
    name: string;
    handle: string;
    status: string;
    createdAt: string;
  }[];
}

interface PendingCommunity {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  creatorId: string;
  createdAt: string;
  status: string;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [pendingCommunities, setPendingCommunities] = useState<PendingCommunity[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<PendingCommunity | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (status === "authenticated") {
      if ((session?.user as any)?.role !== "admin") {
        toast({
          title: "Unauthorized",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        router.push("/");
      } else {
        fetchDashboardData();
      }
    } else if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [session, status, router, toast]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashboardResponse, communityStatsResponse, pendingCommunitiesResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/communities/stats'),
        fetch('/api/admin/communities/pending')
      ]);

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        setDashboardStats(data);
      }

      if (communityStatsResponse.ok) {
        const data = await communityStatsResponse.json();
        setCommunityStats(data);
      }

      if (pendingCommunitiesResponse.ok) {
        const data = await pendingCommunitiesResponse.json();
        setPendingCommunities(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCommunity = async (communityId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/communities/approve/${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        toast({
          title: "Community Approved",
          description: "The community has been approved and is now public",
        });
        // Refresh data
        fetchDashboardData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve community');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve community",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectCommunity = async (communityId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/communities/reject/${communityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        toast({
          title: "Community Rejected",
          description: "The community has been rejected",
        });
        // Reset form and refresh data
        setRejectionReason("");
        setSelectedCommunity(null);
        fetchDashboardData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject community');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject community",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if ((session?.user as any)?.role !== "admin") {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the Gravitas platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="communities">
              Communities
              {(communityStats?.pendingCommunities ?? 0) > 0 && (
                <Badge className="ml-2 bg-red-500">{communityStats?.pendingCommunities}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{dashboardStats?.totalUsers || 0}</h3>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Users className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{dashboardStats?.totalCommunities || 0}</h3>
                  <p className="text-sm text-muted-foreground">Total Communities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Calendar className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{dashboardStats?.totalEvents || 0}</h3>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                    <UserCheck className="h-6 w-6 text-orange-700 dark:text-orange-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{dashboardStats?.totalRegistrations || 0}</h3>
                  <p className="text-sm text-muted-foreground">Event Registrations</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registrations over the past 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* This would be a chart in a real implementation */}
                  <div className="flex h-full items-end gap-2">
                    {dashboardStats?.monthlyGrowth?.map((item, index) => (
                      <div key={index} className="flex flex-1 flex-col items-center">
                        <div 
                          className="w-full bg-primary rounded-t-md" 
                          style={{ 
                            height: `${Math.max(
                              (item.users / Math.max(...dashboardStats.monthlyGrowth.map(i => i.users))) * 200, 
                              20
                            )}px` 
                          }}
                        ></div>
                        <div className="mt-2 text-xs">{item.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardStats?.recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{communityStats?.pendingCommunities || 0}</h3>
                  <p className="text-sm text-muted-foreground">Pending Communities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{communityStats?.approvedCommunities || 0}</h3>
                  <p className="text-sm text-muted-foreground">Approved Communities</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                    <XCircle className="h-6 w-6 text-red-700 dark:text-red-300" />
                  </div>
                  <h3 className="mt-4 text-3xl font-bold">{communityStats?.rejectedCommunities || 0}</h3>
                  <p className="text-sm text-muted-foreground">Rejected Communities</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Pending Communities
                </CardTitle>
                <CardDescription>
                  Communities awaiting approval before they can be publicly visible
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCommunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle className="mb-2 h-12 w-12 text-green-500" />
                    <p className="text-center text-muted-foreground">No pending communities to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCommunities.map((community) => (
                      <Card key={community.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div 
                            className="h-32 w-full md:w-48 bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{
                              backgroundImage: community.banner 
                                ? `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${community.banner})`
                                : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <div className="flex h-full items-center justify-center">
                              <Avatar className="h-16 w-16 border-4 border-white">
                                <AvatarImage src={community.avatar} />
                                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                          <div className="flex-1 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold">{community.name}</h3>
                                <p className="text-sm text-muted-foreground">@{community.handle}</p>
                              </div>
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                Pending
                              </Badge>
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                              {community.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(community.createdAt).toLocaleDateString()}
                            </p>
                            <div className="mt-4 flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="default" className="flex-1">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Community</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve "{community.name}"? This will make the community publicly visible to all users.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleApproveCommunity(community.id)}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? "Processing..." : "Approve Community"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    className="flex-1"
                                    onClick={() => setSelectedCommunity(community)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Community</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejecting this community. This will be shared with the community creator.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium">Community: {selectedCommunity?.name}</h4>
                                      <p className="text-sm text-muted-foreground">@{selectedCommunity?.handle}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <label htmlFor="reason" className="text-sm font-medium">Rejection Reason</label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Enter reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="min-h-[100px]"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleRejectCommunity(selectedCommunity?.id || '', rejectionReason)}
                                      disabled={isProcessing || !rejectionReason.trim()}
                                    >
                                      {isProcessing ? "Processing..." : "Reject Community"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button variant="outline" asChild>
                                <Link href={`/communities/${community.handle}`}>
                                  <Info className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Communities</CardTitle>
                <CardDescription>Latest community creations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {communityStats?.recentCommunities?.map((community) => (
                    <div key={community.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{community.name}</p>
                          <p className="text-sm text-muted-foreground">@{community.handle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {community.status === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            Pending
                          </Badge>
                        )}
                        {community.status === 'approved' && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Approved
                          </Badge>
                        )}
                        {community.status === 'rejected' && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            Rejected
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/communities/${community.handle}`}>
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  This section will be expanded in future updates to include user management features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    User management features coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
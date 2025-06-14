"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, CheckCircle, XCircle, Loader2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface PendingCommunity {
  id: string;
  name: string;
  handle: string;
  description: string;
  creatorName: string;
  creatorEmail: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCommunities, setPendingCommunities] = useState<PendingCommunity[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();
        
        if (!data.isAdmin) {
          router.push('/admin/login');
          return;
        }
        
        setIsAdmin(true);
        fetchPendingCommunities();
      } catch (error) {
        console.error('Error checking admin authentication:', error);
        router.push('/admin/login');
      }
    };

    // Also check localStorage for a quick client-side check
    const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    if (!isAdminAuthenticated) {
      router.push('/admin/login');
      return;
    }

    checkAdminAuth();
  }, [router]);

  const fetchPendingCommunities = async () => {
    try {
      // This would be a real API call in a complete implementation
      // For now, we'll use mock data
      const mockPendingCommunities: PendingCommunity[] = [
        {
          id: '1',
          name: 'Tech Enthusiasts',
          handle: 'tech-enthusiasts',
          description: 'A community for tech lovers and enthusiasts',
          creatorName: 'John Doe',
          creatorEmail: 'john@example.com',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Art & Design',
          handle: 'art-design',
          description: 'For artists and designers to share their work and ideas',
          creatorName: 'Jane Smith',
          creatorEmail: 'jane@example.com',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Fitness Club',
          handle: 'fitness-club',
          description: 'Stay fit and healthy with our community',
          creatorName: 'Mike Johnson',
          creatorEmail: 'mike@example.com',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setPendingCommunities(mockPendingCommunities);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pending communities:', error);
      toast({
        title: "Error",
        description: "Failed to load pending communities",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleApproveCommunity = async (id: string) => {
    setProcessingId(id);
    try {
      // This would be a real API call in a complete implementation
      // await fetch(`/api/admin/communities/${id}/approve`, { method: 'POST' });
      
      // For now, just update the UI
      setPendingCommunities(prev => prev.filter(community => community.id !== id));
      
      toast({
        title: "Community Approved",
        description: "The community has been approved and is now public",
      });
    } catch (error) {
      console.error('Error approving community:', error);
      toast({
        title: "Error",
        description: "Failed to approve community",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectCommunity = async (id: string) => {
    setProcessingId(id);
    try {
      // This would be a real API call in a complete implementation
      // await fetch(`/api/admin/communities/${id}/reject`, { method: 'POST' });
      
      // For now, just update the UI
      setPendingCommunities(prev => prev.filter(community => community.id !== id));
      
      toast({
        title: "Community Rejected",
        description: "The community has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting community:', error);
      toast({
        title: "Error",
        description: "Failed to reject community",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    // Clear admin authentication
    localStorage.removeItem('adminAuthenticated');
    
    // This would also clear the cookie in a complete implementation
    // fetch('/api/admin/logout', { method: 'POST' });
    
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin dashboard",
    });
    
    router.push('/admin/login');
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage community approvals and platform settings</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">
            Pending Approvals <Badge className="ml-2">{pendingCommunities.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Community Approvals</CardTitle>
              <CardDescription>
                Review and approve community creation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
                  <p className="text-muted-foreground text-center">
                    All community requests have been processed
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCommunities.map((community) => (
                      <TableRow key={community.id}>
                        <TableCell className="font-medium">{community.name}</TableCell>
                        <TableCell>@{community.handle}</TableCell>
                        <TableCell>
                          <div>
                            <div>{community.creatorName}</div>
                            <div className="text-sm text-muted-foreground">{community.creatorEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(community.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveCommunity(community.id)}
                              disabled={processingId === community.id}
                            >
                              {processingId === community.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={processingId === community.id}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Community</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject this community? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRejectCommunity(community.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communities">
          <Card>
            <CardHeader>
              <CardTitle>Approved Communities</CardTitle>
              <CardDescription>
                Manage existing communities on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Community Management</h3>
                <p className="text-muted-foreground text-center mb-4">
                  This section will allow you to manage all approved communities
                </p>
                <Button disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>
                Configure platform settings and admin preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Platform Settings</h3>
                <p className="text-muted-foreground text-center mb-4">
                  This section will allow you to configure platform-wide settings
                </p>
                <Button disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
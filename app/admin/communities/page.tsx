"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Search, Filter, Eye } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Community {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatar: string;
  banner: string;
  status: string;
  creatorId: string;
  createdAt: string;
  membersCount?: number;
  followersCount?: number;
  isVerified?: boolean;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminCommunitiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<Community[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          console.log('No admin token found, redirecting to login'); // Debug log
          router.replace('/admin/login');
          return;
        }

        console.log('Checking admin auth with token:', adminToken); // Debug log
        const response = await fetch('/api/admin/check-auth', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        console.log('Auth check response status:', response.status); // Debug log
        const data = await response.json();
        console.log('Auth check response data:', data); // Debug log

        if (!response.ok || !data.isAdmin) {
          console.log('Auth check failed, removing token and redirecting'); // Debug log
          localStorage.removeItem('adminToken');
          router.replace('/admin/login');
          return;
        }
        
        // If we get here, we're authenticated as admin
        console.log('Admin auth successful, fetching communities'); // Debug log
        fetchCommunities();
      } catch (error) {
        console.error('Error checking admin authentication:', error);
        localStorage.removeItem('adminToken');
        router.replace('/admin/login');
      }
    };

    checkAdminAuth();
  }, [router]);

  const fetchCommunities = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.log('No admin token found during fetch, redirecting to login'); // Debug log
        router.replace('/admin/login');
        return;
      }

      console.log('Fetching communities with token:', adminToken); // Debug log
      // Fetch all communities
      const allCommunitiesResponse = await fetch('/api/explore/communities', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Fetch pending communities
      const pendingCommunitiesResponse = await fetch('/api/admin/communities/pending', {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      console.log('Communities response status:', allCommunitiesResponse.status); // Debug log
      console.log('Pending communities response status:', pendingCommunitiesResponse.status); // Debug log

      if (!allCommunitiesResponse.ok || !pendingCommunitiesResponse.ok) {
        if (allCommunitiesResponse.status === 401 || pendingCommunitiesResponse.status === 401) {
          console.log('Unauthorized response, removing token and redirecting'); // Debug log
          localStorage.removeItem('adminToken');
          router.replace('/admin/login');
          return;
        }
        throw new Error('Failed to fetch communities');
      }

      const [allCommunitiesData, pendingCommunitiesData] = await Promise.all([
        allCommunitiesResponse.json(),
        pendingCommunitiesResponse.json()
      ]);

      console.log('Fetched communities data:', allCommunitiesData); // Debug log
      console.log('Fetched pending communities data:', pendingCommunitiesData); // Debug log

      setCommunities(allCommunitiesData);
      setPendingCommunities(pendingCommunitiesData);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load communities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCommunity = async (id: string) => {
    setProcessingId(id);
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token from localStorage:', adminToken); // Debug log

      if (!adminToken) {
        toast({
          title: "Error",
          description: "Admin session expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      // Verify admin status first
      const verifyResponse = await fetch('/api/admin/check-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!verifyResponse.ok) {
        console.log('Admin verification failed:', verifyResponse.status); // Debug log
        localStorage.removeItem('adminToken');
        toast({
          title: "Session Expired",
          description: "Your admin session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      const verifyData = await verifyResponse.json();
      console.log('Admin verification response:', verifyData); // Debug log

      if (!verifyData.isAdmin) {
        console.log('Not authorized as admin'); // Debug log
        localStorage.removeItem('adminToken');
        toast({
          title: "Access Denied",
          description: "You must be an admin to perform this action",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      console.log('Sending approve request with token:', adminToken); // Debug log
      const response = await fetch(`/api/admin/communities/approve/${id}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('Approve response status:', response.status); // Debug log
      const responseData = await response.json();
      console.log('Approve response data:', responseData); // Debug log

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        toast({
          title: "Session Expired",
          description: "Your admin session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to approve community');
      }
      
      // Update the UI
      setPendingCommunities(prev => prev.filter(community => community.id !== id));
      
      // Refresh data
      fetchCommunities();
      
      toast({
        title: "Community Approved",
        description: "The community has been approved and is now public",
      });
    } catch (error) {
      console.error('Error approving community:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve community",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (community: Community) => {
    setSelectedCommunity(community);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  };

  const handleRejectCommunity = async () => {
    if (!selectedCommunity) return;
    
    setProcessingId(selectedCommunity.id);
    setIsRejectionDialogOpen(false);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token from localStorage:', adminToken); // Debug log

      if (!adminToken) {
        toast({
          title: "Error",
          description: "Admin session expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      // Verify admin status first
      const verifyResponse = await fetch('/api/admin/check-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!verifyResponse.ok) {
        console.log('Admin verification failed:', verifyResponse.status); // Debug log
        localStorage.removeItem('adminToken');
        toast({
          title: "Session Expired",
          description: "Your admin session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      const verifyData = await verifyResponse.json();
      console.log('Admin verification response:', verifyData); // Debug log

      if (!verifyData.isAdmin) {
        console.log('Not authorized as admin'); // Debug log
        localStorage.removeItem('adminToken');
        toast({
          title: "Access Denied",
          description: "You must be an admin to perform this action",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      console.log('Sending reject request with token:', adminToken); // Debug log
      const response = await fetch(`/api/admin/communities/reject/${selectedCommunity.id}`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      console.log('Reject response status:', response.status); // Debug log
      const responseData = await response.json();
      console.log('Reject response data:', responseData); // Debug log

      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        toast({
          title: "Session Expired",
          description: "Your admin session has expired. Please log in again.",
          variant: "destructive",
        });
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to reject community');
      }
      
      // Update the UI
      setPendingCommunities(prev => prev.filter(community => community.id !== selectedCommunity.id));
      
      // Refresh data
      fetchCommunities();
      
      toast({
        title: "Community Rejected",
        description: "The community has been rejected",
      });
    } catch (error) {
      console.error('Error rejecting community:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject community",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
      setSelectedCommunity(null);
    }
  };

  const viewCommunityDetails = (community: Community) => {
    setSelectedCommunity(community);
    setIsViewDialogOpen(true);
  };

  const filteredCommunities = communities.filter(community => {
    // Apply search filter
    const matchesSearch = 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    const matchesStatus = 
      statusFilter === 'all' || 
      community.status === statusFilter ||
      (statusFilter === 'approved' && !community.status); // For backward compatibility
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-200px)] flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading communities...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
        <p className="text-muted-foreground">Manage and moderate communities on the platform</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Communities</TabsTrigger>
          <TabsTrigger value="pending">
            Pending <Badge className="ml-2">{pendingCommunities.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>All Communities</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search communities..."
                      className="pl-10 w-full md:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCommunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground text-center">
                    No communities found matching your filters
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Community</TableHead>
                        <TableHead>Handle</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCommunities.map((community) => (
                        <TableRow key={community.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={community.avatar} />
                                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{community.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>@{community.handle}</TableCell>
                          <TableCell>
                            {community.status === 'approved' || !community.status ? (
                              <Badge className="bg-green-500">Approved</Badge>
                            ) : community.status === 'pending' ? (
                              <Badge variant="outline" className="border-yellow-300 text-yellow-600">Pending</Badge>
                            ) : (
                              <Badge variant="outline" className="border-red-300 text-red-600">Rejected</Badge>
                            )}
                          </TableCell>
                          <TableCell>{community.membersCount || 0}</TableCell>
                          <TableCell>{new Date(community.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewCommunityDetails(community)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <Link href={`/communities/${community.handle}`} target="_blank">
                                  Visit
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                      <TableHead>Community</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingCommunities.map((community) => (
                      <TableRow key={community.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={community.avatar} />
                              <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{community.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>@{community.handle}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {community.description}
                        </TableCell>
                        <TableCell>
                          {new Date(community.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => viewCommunityDetails(community)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
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
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openRejectDialog(community)}
                              disabled={processingId === community.id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
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

        <TabsContent value="verified">
          <Card>
            <CardHeader>
              <CardTitle>Verified Communities</CardTitle>
              <CardDescription>
                Manage verified communities on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Community</TableHead>
                      <TableHead>Handle</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Followers</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communities
                      .filter(community => community.isVerified)
                      .map((community) => (
                        <TableRow key={community.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={community.avatar} />
                                <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{community.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>@{community.handle}</TableCell>
                          <TableCell>{community.membersCount || 0}</TableCell>
                          <TableCell>{community.followersCount || 0}</TableCell>
                          <TableCell>{new Date(community.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewCommunityDetails(community)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                              >
                                <Link href={`/communities/${community.handle}`} target="_blank">
                                  Visit
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Community Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Community Details</DialogTitle>
          </DialogHeader>
          {selectedCommunity && (
            <div className="space-y-4">
              <div className="relative">
                <div 
                  className="h-40 w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{
                    backgroundImage: selectedCommunity.banner 
                      ? `url(${selectedCommunity.banner})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute -bottom-6 left-4">
                  <Avatar className="h-12 w-12 border-4 border-background">
                    <AvatarImage src={selectedCommunity.avatar} />
                    <AvatarFallback>{selectedCommunity.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              
              <div className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{selectedCommunity.name}</h3>
                    <p className="text-sm text-muted-foreground">@{selectedCommunity.handle}</p>
                  </div>
                  <Badge 
                    className={
                      selectedCommunity.status === 'approved' || !selectedCommunity.status
                        ? "bg-green-500"
                        : selectedCommunity.status === 'pending'
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    {selectedCommunity.status || 'Approved'}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedCommunity.description}</p>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedCommunity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Creator ID</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {selectedCommunity.creatorId}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                {selectedCommunity.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleApproveCommunity(selectedCommunity.id);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        openRejectDialog(selectedCommunity);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  asChild
                >
                  <Link href={`/communities/${selectedCommunity.handle}`} target="_blank">
                    Visit Community
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Community</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this community. This will be sent to the community creator.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectCommunity}
              disabled={!rejectionReason.trim()}
            >
              Reject Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
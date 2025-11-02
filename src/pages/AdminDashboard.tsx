import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, Tag, Users, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("products");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const isAdmin = profile?.is_admin;
  const AUTH_KEY = "__app_admin_authenticated";
  const [localAdmin, setLocalAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(AUTH_KEY);
      setLocalAdmin(val === "true");
    } catch (e) {
      setLocalAdmin(false);
    }
  }, []);

  useEffect(() => {
    console.log('Debug Info:', {
      hasSession: !!session,
      userId: session?.user?.id,
      profile: profile,
      isAdmin: isAdmin,
      isLoadingProfile: isLoadingProfile
    });

    if (isLoadingProfile) {
      console.log('Profile is still loading...');
      return; // Do nothing while profile is loading
    }

    // Allow access if local admin flag is present (AdminGuard)
    if (!session) {
      if (localAdmin) {
        console.log('No supabase session found, but local admin flag is present — allowing access');
        return;
      }
      console.log('No session found, redirecting to auth');
      navigate("/auth");
      return;
    }

    if (session && !isAdmin) {
      // If session exists but user is not an admin, and no local admin flag, redirect
      if (!localAdmin) {
        console.log('User is not admin, redirecting to dashboard');
        navigate("/dashboard"); // Redirect non-admin users
        return;
      }
    }

    console.log('User is admin or local admin flag present, staying on admin dashboard');
  }, [session, navigate, isAdmin, profile, isLoadingProfile]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }

    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (e) {
      // ignore
    }

    toast.success("Signed out successfully");
    navigate("/");
  };

  const allowed = localAdmin || (session && isAdmin);

  // Fetch Products
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*");
      return data;
    },
    enabled: !!allowed,
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data;
    },
    enabled: !!allowed,
  });

  // Fetch Orders
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select(`
        *,
        order_items (
          *,
          products (name, price)
        )
      `);
      return data;
    },
    enabled: !!allowed,
  });

  // Fetch Users
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data;
    },
    enabled: !!allowed,
  });

  // Real-time subscriptions
  useEffect(() => {
    if (!allowed) return;

    const productSubscription = supabase
      .channel("products_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
      })
      .subscribe();

    const categorySubscription = supabase
      .channel("categories_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () => {
        queryClient.invalidateQueries({ queryKey: ["categories"] });
      })
      .subscribe();

    const orderSubscription = supabase
      .channel("orders_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      })
      .subscribe();

    const userSubscription = supabase
      .channel("profiles_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productSubscription);
      supabase.removeChannel(categorySubscription);
      supabase.removeChannel(orderSubscription);
      supabase.removeChannel(userSubscription);
    };
  }, [isAdmin, queryClient]);

  if (isLoadingProfile || !session || !isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-5xl font-bold mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground font-elegant text-lg">
                Manage your store
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Trending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.id.slice(0, 8)}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.slug}</TableCell>
                          <TableCell>₹{product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.featured ? "Yes" : "No"}</TableCell>
                          <TableCell>{product.trending ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Category Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories?.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.id.slice(0, 8)}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.slug}</TableCell>
                          <TableCell>{category.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders?.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{order.user_id.slice(0, 8)}</TableCell>
                          <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                          <TableCell>{order.status}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="luxury-shadow">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Loyalty Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id.slice(0, 8)}</TableCell>
                          <TableCell>{user.full_name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>{user.is_admin ? "Yes" : "No"}</TableCell>
                          <TableCell>{user.loyalty_points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

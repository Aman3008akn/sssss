import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, Heart, User } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: orders } = useQuery({
    queryKey: ["orders", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            products (name, price, images)
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: wishlist } = useQuery({
    queryKey: ["wishlist", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from("wishlist")
        .select(`
          *,
          products (*)
        `)
        .eq("user_id", session.user.id);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!session) {
      navigate("/auth");
    }
  }, [session, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-5xl font-bold mb-2">
                Welcome Back
              </h1>
              <p className="text-muted-foreground font-elegant text-lg">
                {profile?.full_name || session.user.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <div className="space-y-4">
                {orders?.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground font-elegant">No orders yet</p>
                  </Card>
                ) : (
                  orders?.map((order) => (
                    <Card key={order.id} className="luxury-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                            {order.status}
                          </span>
                        </div>
                        <div className="border-t border-border pt-4">
                          <p className="font-semibold text-lg">
                            Total: <span className="text-primary">₹{order.total_amount.toLocaleString()}</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="wishlist">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist?.length === 0 ? (
                  <Card className="p-12 text-center col-span-full">
                    <p className="text-muted-foreground font-elegant">No items in wishlist</p>
                  </Card>
                ) : (
                  wishlist?.map((item) => (
                    <Card key={item.id} className="luxury-shadow">
                      <CardContent className="p-0">
                        <img
                          src={item.products.images[0]}
                          alt={item.products.name}
                          className="w-full aspect-square object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <h3 className="font-heading text-lg mb-2">{item.products.name}</h3>
                          <p className="text-primary font-semibold">
                            ₹{item.products.price.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="luxury-shadow">
                <CardContent className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Full Name</label>
                      <p className="text-lg">{profile?.full_name || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-lg">{profile?.email || session.user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phone</label>
                      <p className="text-lg">{profile?.phone || "Not set"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Membership Tier</label>
                      <p className="text-lg capitalize">{profile?.membership_tier || "Standard"}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Loyalty Points</label>
                      <p className="text-lg text-primary">{profile?.loyalty_points || 0} points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

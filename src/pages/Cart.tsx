import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Cart = () => {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: cartItems } = useQuery({
    queryKey: ["cart", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            images,
            slug,
            stock
          )
        `)
        .eq("user_id", session.user.id);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity < 1) return;
      await supabase.from("cart_items").update({ quantity }).eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("cart_items").delete().eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("Item removed from cart");
    },
  });

  const total = cartItems?.reduce(
    (sum, item) => sum + (item.products?.price || 0) * item.quantity,
    0
  ) || 0;

  if (!session) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <Card className="max-w-md mx-auto p-8 text-center">
            <p className="text-lg mb-4">Please sign in to view your cart</p>
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="font-heading text-5xl font-bold mb-8">
          Shopping <span className="text-gradient-gold">Cart</span>
        </h1>

        {cartItems?.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-6 font-elegant">
              Your cart is empty
            </p>
            <Link to="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map((item) => (
                <Card key={item.id} className="luxury-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={item.products?.images[0]}
                        alt={item.products?.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <Link to={`/product/${item.products?.slug}`}>
                          <h3 className="font-heading text-xl mb-2 hover:text-primary transition-colors">
                            {item.products?.name}
                          </h3>
                        </Link>
                        <p className="text-primary font-semibold text-lg">
                          ₹{item.products?.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity.mutate({
                            id: item.id,
                            quantity: item.quantity - 1,
                          })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity.mutate({
                            id: item.id,
                            quantity: item.quantity + 1,
                          })}
                          disabled={item.quantity >= (item.products?.stock || 0)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem.mutate(item.id)}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="luxury-shadow sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold text-primary">Free</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/checkout">
                    <Button className="w-full gold-shadow mb-3">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link to="/shop">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

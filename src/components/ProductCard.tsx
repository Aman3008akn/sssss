import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
}

export const ProductCard = ({ id, name, price, originalPrice, image, slug }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: isWishlisted } = useQuery({
    queryKey: ["wishlist-item", id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", id)
        .single();
      return !!data;
    },
    enabled: !!session?.user?.id,
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        toast.error("Please login to add to wishlist");
        return;
      }

      if (isWishlisted) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", session.user.id)
          .eq("product_id", id);
      } else {
        await supabase
          .from("wishlist")
          .insert({ user_id: session.user.id, product_id: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-item", id] });
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        toast.error("Please login to add to cart");
        return;
      }

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", session.user.id)
        .eq("product_id", id)
        .single();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: session.user.id, product_id: id, quantity: 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("Added to cart");
    },
  });

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <Card
      className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        <Link to={`/product/${slug}`} className="block relative overflow-hidden aspect-square">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full">
              -{discount}%
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist.mutate();
            }}
          >
            <Heart
              className={`h-5 w-5 ${isWishlisted ? "fill-primary text-primary" : ""}`}
            />
          </Button>
        </Link>

        <div className="p-4">
          <Link to={`/product/${slug}`}>
            <h3 className="font-heading text-lg mb-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-primary">
                ₹{price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => addToCart.mutate()}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

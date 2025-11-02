import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import productRing from "@/assets/product-ring.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productClutch from "@/assets/product-clutch.jpg";

const ProductDetail = () => {
  const { slug } = useParams();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("slug", slug)
        .single();
      
      if (data) {
        const productImages = [productRing, productWatch, productPerfume, productClutch];
        const imageIndex = data.name.includes("Ring") ? 0 : 
                          data.name.includes("Watch") ? 1 :
                          data.name.includes("Perfume") ? 2 : 3;
        return { ...data, images: [productImages[imageIndex]] };
      }
      return data;
    },
  });

  const { data: isWishlisted } = useQuery({
    queryKey: ["wishlist-item", product?.id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !product?.id) return false;
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .single();
      return !!data;
    },
    enabled: !!session?.user?.id && !!product?.id,
  });

  const toggleWishlist = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !product?.id) {
        toast.error("Please login to add to wishlist");
        return;
      }

      if (isWishlisted) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", session.user.id)
          .eq("product_id", product.id);
      } else {
        await supabase
          .from("wishlist")
          .insert({ user_id: session.user.id, product_id: product.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist-item"] });
      toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !product?.id) {
        toast.error("Please login to add to cart");
        return;
      }

      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", session.user.id)
        .eq("product_id", product.id)
        .single();

      if (existing) {
        await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + 1 })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("cart_items")
          .insert({ user_id: session.user.id, product_id: product.id, quantity: 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-count"] });
      toast.success("Added to cart");
    },
  });

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <p className="text-center">Product not found</p>
        </div>
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <Link to="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden luxury-shadow">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold rounded-full">
                -{discount}% OFF
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                {product.categories?.name}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-bold text-primary">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-2xl text-muted-foreground line-through">
                  ₹{product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8 font-elegant">
              {product.description}
            </p>

            <div className="flex items-center gap-2 mb-8">
              {product.stock > 0 ? (
                <>
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <span className="text-destructive font-medium">Out of Stock</span>
              )}
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 gold-shadow"
                onClick={() => addToCart.mutate()}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggleWishlist.mutate()}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-primary text-primary" : ""}`}
                />
              </Button>
            </div>

            <div className="border-t border-border pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground font-elegant">
                  Handcrafted with premium materials
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground font-elegant">
                  Lifetime warranty included
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <p className="text-muted-foreground font-elegant">
                  Free worldwide shipping
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

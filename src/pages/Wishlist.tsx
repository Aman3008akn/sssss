import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import productRing from "@/assets/product-ring.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productClutch from "@/assets/product-clutch.jpg";

const Wishlist = () => {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
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
      
      const productImages = [productRing, productWatch, productPerfume, productClutch];
      return data?.map((item, index) => ({
        ...item,
        products: {
          ...item.products,
          images: [productImages[index % productImages.length]]
        }
      }));
    },
    enabled: !!session?.user?.id,
  });

  if (!session) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 pb-20">
          <Card className="max-w-md mx-auto p-8 text-center">
            <p className="text-lg mb-4">Please sign in to view your wishlist</p>
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
          Your <span className="text-gradient-gold">Wishlist</span>
        </h1>

        {wishlist?.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-6 font-elegant">
              Your wishlist is empty
            </p>
            <Link to="/shop">
              <Button>Explore Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist?.map((item) => (
              <ProductCard
                key={item.id}
                id={item.products.id}
                name={item.products.name}
                price={item.products.price}
                originalPrice={item.products.original_price}
                image={item.products.images[0]}
                slug={item.products.slug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

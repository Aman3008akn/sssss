import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import heroImage from "@/assets/hero-luxury.jpg";
import productRing from "@/assets/product-ring.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productClutch from "@/assets/product-clutch.jpg";

const Index = () => {
  const { data: featuredProducts } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .limit(4);
      
      // Map placeholder images to actual images
      return data?.map((product, index) => ({
        ...product,
        images: [productRing, productWatch, productPerfume, productClutch][index] || product.images[0]
      }));
    },
  });

  const { data: trendingProducts } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("trending", true)
        .limit(4);
      
      return data?.map((product, index) => ({
        ...product,
        images: [productWatch, productPerfume, productClutch, productRing][index] || product.images[0]
      }));
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden mt-20">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury jewelry"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in">
            Experience
            <span className="block text-gradient-gold">Timeless Luxury</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-elegant">
            Discover an exclusive collection of handcrafted jewelry, premium watches, and designer accessories
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="group gold-shadow">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Luna Luxe */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Handcrafted Excellence</h3>
              <p className="text-muted-foreground font-elegant">
                Each piece is meticulously crafted by master artisans
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Lifetime Guarantee</h3>
              <p className="text-muted-foreground font-elegant">
                Premium quality backed by our lifetime warranty
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Exclusive Delivery</h3>
              <p className="text-muted-foreground font-elegant">
                Complimentary white-glove delivery worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground text-lg font-elegant">
              Curated pieces from our finest selection
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images}
                slug={product.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              Trending Now
            </h2>
            <p className="text-muted-foreground text-lg font-elegant">
              Most coveted pieces this season
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts?.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                image={product.images}
                slug={product.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-2xl font-bold text-gradient-gold mb-4">Luna Luxe</h3>
              <p className="text-muted-foreground font-elegant text-sm">
                Defining luxury through timeless elegance and exceptional craftsmanship.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
                <li><Link to="/shop?category=jewelry" className="text-muted-foreground hover:text-primary transition-colors">Jewelry</Link></li>
                <li><Link to="/shop?category=watches" className="text-muted-foreground hover:text-primary transition-colors">Watches</Link></li>
                <li><Link to="/shop?category=accessories" className="text-muted-foreground hover:text-primary transition-colors">Accessories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Customer Care</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-4">Newsletter</h4>
              <p className="text-muted-foreground text-sm mb-4 font-elegant">
                Subscribe for exclusive offers and updates
              </p>
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Luna Luxe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import productRing from "@/assets/product-ring.jpg";
import productWatch from "@/assets/product-watch.jpg";
import productPerfume from "@/assets/product-perfume.jpg";
import productClutch from "@/assets/product-clutch.jpg";

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)");

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("featured", { ascending: false });
      }

      const { data } = await query;
      
      const productImages = [productRing, productWatch, productPerfume, productClutch];
      return data?.map((product, index) => ({
        ...product,
        images: productImages[index % productImages.length] || product.images[0]
      }));
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <h1 className="font-heading text-5xl font-bold mb-4 text-center">
          Luxury <span className="text-gradient-gold">Collection</span>
        </h1>
        <p className="text-center text-muted-foreground text-lg mb-12 font-elegant">
          Explore our curated selection of exceptional pieces
        </p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products?.map((product) => (
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

        {products?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg font-elegant">
              No products found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

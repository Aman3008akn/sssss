import { Navbar } from "@/components/Navbar";
import { Sparkles, Heart, Globe } from "lucide-react";
import craftsmanshipImage from "@/assets/about-craftsmanship.jpg";

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 text-center">
            The Luna Luxe <span className="text-gradient-gold">Story</span>
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-16 font-elegant max-w-2xl mx-auto">
            Where timeless elegance meets exceptional craftsmanship
          </p>

          {/* Hero Image */}
          <div className="relative h-96 rounded-lg overflow-hidden mb-16 luxury-shadow">
            <img
              src={craftsmanshipImage}
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          {/* Story Content */}
          <div className="space-y-8 mb-16">
            <div>
              <h2 className="font-heading text-3xl font-bold mb-4">Our Heritage</h2>
              <p className="text-muted-foreground leading-relaxed font-elegant text-lg">
                Founded with a vision to redefine luxury, Luna Luxe represents the pinnacle of fine craftsmanship 
                and timeless design. Each piece in our collection tells a story of passion, precision, and the 
                pursuit of perfection.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl font-bold mb-4">Master Craftsmanship</h2>
              <p className="text-muted-foreground leading-relaxed font-elegant text-lg">
                Our artisans bring decades of expertise, meticulously handcrafting each piece using techniques 
                passed down through generations. From the selection of the finest materials to the final polish, 
                every step is executed with uncompromising attention to detail.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl font-bold mb-4">Sustainability Promise</h2>
              <p className="text-muted-foreground leading-relaxed font-elegant text-lg">
                We believe true luxury is sustainable. That's why we source only ethically-produced materials 
                and partner with craftspeople who share our commitment to environmental responsibility and 
                fair trade practices.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Excellence</h3>
              <p className="text-muted-foreground font-elegant">
                Uncompromising quality in every detail
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Passion</h3>
              <p className="text-muted-foreground font-elegant">
                Crafted with love and dedication
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg bg-card luxury-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl mb-2">Responsibility</h3>
              <p className="text-muted-foreground font-elegant">
                Committed to ethical practices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

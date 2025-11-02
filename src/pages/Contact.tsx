import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-heading text-5xl font-bold mb-4 text-center">
            Get in <span className="text-gradient-gold">Touch</span>
          </h1>
          <p className="text-center text-muted-foreground text-lg mb-16 font-elegant">
            We're here to assist you with any inquiries
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="luxury-shadow">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground font-elegant">
                  contact@lunaluxe.com
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-shadow">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground font-elegant">
                  +91 99999 99999
                </p>
              </CardContent>
            </Card>

            <Card className="luxury-shadow">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">Visit Us</h3>
                <p className="text-muted-foreground font-elegant">
                  Mumbai, India
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="luxury-shadow">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more..."
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gold-shadow">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-12 p-8 rounded-lg bg-secondary/30 text-center">
            <h3 className="font-heading text-2xl font-bold mb-4">Customer Support</h3>
            <p className="text-muted-foreground font-elegant mb-4">
              Our dedicated support team is available Monday through Saturday, 10 AM to 8 PM IST
            </p>
            <p className="text-sm text-muted-foreground">
              For urgent inquiries, please call us directly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

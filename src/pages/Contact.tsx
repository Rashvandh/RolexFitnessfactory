import PublicLayout from "@/components/PublicLayout";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => (
  <PublicLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
          GET IN <span className="text-gradient">TOUCH</span>
        </h1>
        <p className="text-muted-foreground text-center mb-16 max-w-lg mx-auto">
          Have questions? We'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold mb-1">Email</h3>
                <p className="text-muted-foreground text-sm">contact@rolecfitness.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold mb-1">Phone</h3>
                <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold mb-1">Location</h3>
                <p className="text-muted-foreground text-sm">123 Fitness Ave, Los Angeles, CA 90001</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Name</label>
                <input type="text" placeholder="Your name" className="dark-input w-full px-4 py-3 rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <input type="email" placeholder="you@example.com" className="dark-input w-full px-4 py-3 rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Message</label>
                <textarea rows={4} placeholder="Your message..." className="dark-input w-full px-4 py-3 rounded-md resize-none" />
              </div>
              <button type="submit" className="neon-glow-btn w-full py-3 rounded-md font-heading text-sm tracking-wider">
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Contact;

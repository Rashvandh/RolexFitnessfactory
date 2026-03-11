import PublicLayout from "@/components/PublicLayout";
import { Link } from "react-router-dom";
import { Dumbbell, Users, BarChart3, Shield, Zap, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";


const features = [
  { icon: Users, title: "Member Management", desc: "Track all members, attendance, and subscriptions in one place." },
  { icon: Dumbbell, title: "Workout Tracking", desc: "Custom workout plans assigned by trainers with progress monitoring." },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Revenue, attendance, and performance reports at a glance." },
  { icon: Shield, title: "Secure Access", desc: "Role-based login for admins, trainers, and members." },
  { icon: Zap, title: "QR Attendance", desc: "Quick check-in with QR codes and streak tracking." },
  { icon: Star, title: "Fee Management", desc: "Automated fee tracking with payment status alerts." },
];

const testimonials = [
  { name: "Alex Thompson", role: "Gym Owner", text: "Rolex Fitness Factory transformed how we manage our 500+ members. The dashboard is incredible." },
  { name: "Sarah Chen", role: "Personal Trainer", text: "I can track all my clients' progress and update workout plans instantly." },
  { name: "Mike Rodriguez", role: "Member", text: "The QR check-in and streak counter keep me motivated every day." },
];

const Home = () => (
  <PublicLayout>
    {/* Hero */}
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Dark gym interior with neon red lighting" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
          MANAGE YOUR <span className="text-gradient neon-text">GYM</span>
          <br />LIKE A PRO
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          The ultimate gym management system with member tracking, trainer dashboards, QR attendance, and real-time analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Link to="/register" className="neon-glow-btn px-8 py-3 rounded-md text-base font-heading tracking-wider">
            GET STARTED
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-4">
          POWERFUL <span className="text-gradient">FEATURES</span>
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Everything you need to run a world-class fitness center.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="stat-card group cursor-default animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-sm font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">
          WHAT THEY <span className="text-gradient">SAY</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-6">
              <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
              <p className="font-heading text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-primary">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          READY TO <span className="text-gradient">TRANSFORM</span> YOUR GYM?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join hundreds of gym owners who trust Rolex Fitness Factory to manage their fitness empire.
        </p>
        <Link to="/register" className="neon-glow-btn px-10 py-4 rounded-md text-base font-heading tracking-wider inline-block">
          START FREE TRIAL
        </Link>
      </div>
    </section>
  </PublicLayout>
);

export default Home;

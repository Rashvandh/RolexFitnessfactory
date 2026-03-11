import PublicLayout from "@/components/PublicLayout";
import { Target, Heart, Trophy, Users } from "lucide-react";

const values = [
  { icon: Target, title: "Mission", desc: "To empower gym owners with cutting-edge management tools that streamline operations and enhance member experience." },
  { icon: Heart, title: "Passion", desc: "Built by fitness enthusiasts who understand the unique challenges of running a modern gym." },
  { icon: Trophy, title: "Excellence", desc: "We strive for perfection in every feature, every update, and every interaction." },
  { icon: Users, title: "Community", desc: "Join a growing network of 500+ gyms that trust Rolex Fitness Factory to manage their operations." },
];

const About = () => (
  <PublicLayout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4 animate-fade-in">
          ABOUT <span className="text-gradient">Rolex Fitness Factory</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          We're building the future of gym management — one feature at a time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
          {values.map((v, i) => (
            <div key={v.title} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <v.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading text-sm font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-12 max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">OUR <span className="text-gradient">STORY</span></h2>
          <p className="text-muted-foreground leading-relaxed">
            Founded in 2024, Rolex Fitness Factory was born from the frustration of managing a gym with outdated spreadsheets and fragmented tools.
            Our team of developers and fitness professionals came together to create an all-in-one platform that handles everything
            from member check-ins to revenue analytics. Today, we serve over 500 fitness centers worldwide, processing thousands
            of check-ins daily.
          </p>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;

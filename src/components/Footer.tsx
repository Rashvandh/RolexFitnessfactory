import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="grid-bg border-t border-border">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-bold tracking-wider uppercase">
              Rolex Fitness Factory
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Premium gym management system built for modern fitness centers.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["/", "/about", "/contact"].map((to, i) => (
              <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {["Home", "About", "Contact"][i]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 text-foreground">Dashboards</h4>
          <div className="flex flex-col gap-2">
            {["/login/admin", "/login/trainer", "/login/user"].map((to, i) => (
              <Link key={to} to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {["Admin", "Trainer", "User"][i]}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold mb-4 text-foreground">Contact</h4>
          <p className="text-sm text-muted-foreground">contact@rolecfitness.com</p>
          <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
        © 2026 Rolex Fitness Factory. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

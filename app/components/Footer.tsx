import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  Services: ["SEO & Local SEO", "Google Ads", "Website Design", "Social Media"],
  Company: ["About Us", "Case Studies", "Blog", "Careers"],
  Trades: ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping"],
  Legal: ["Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#08080E]">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#FF5C28] flex items-center justify-center">
                <span className="text-white font-black text-sm">D</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Deeno<span className="text-[#FF5C28]">.</span>
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-5">
              The home services marketing agency that actually delivers.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <Icon size={14} className="text-white/40" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/30 hover:text-white/70 text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/20 text-xs">
            © 2025 Deeno Brands LLC. All rights reserved.
          </p>
          <p className="text-white/15 text-xs">
            Helping home service businesses grow since 2019.
          </p>
        </div>
      </div>
    </footer>
  );
}

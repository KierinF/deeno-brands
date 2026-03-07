import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const footerLinks = {
  Services: ["SEO & Local SEO", "Google Ads", "Website Design", "Social Media"],
  Company: ["About Us", "Case Studies", "Blog", "Careers"],
  Trades: ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping"],
  Legal: ["Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer className="bg-[#08080E] border-t border-white/5">
      {/* Top strip */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF5C28] flex items-center justify-center">
              <span className="text-white font-black text-xs">D</span>
            </div>
            <span className="text-white font-bold tracking-tight">
              Deeno<span className="text-[#FF5C28]">.</span>
            </span>
          </div>
          <a
            href="mailto:kierin@deenobrands.agency"
            className="text-white/30 hover:text-white text-sm transition-colors"
          >
            kierin@deenobrands.agency
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-white/25 text-sm leading-relaxed mb-6 max-w-[180px]">
              Home Services Marketing. Built for trades that want to win.
            </p>
            <div className="flex gap-2.5">
              {[Facebook, Instagram, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/4 hover:bg-white/8 flex items-center justify-center transition-colors"
                >
                  <Icon size={13} className="text-white/35" />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-white/35 text-[10px] font-semibold uppercase tracking-widest mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/25 hover:text-white/60 text-sm transition-colors">
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
          <p className="text-white/15 text-xs">
            © 2025 Deeno Brands LLC. All rights reserved.
          </p>
          <p className="text-white/10 text-xs">
            Helping home service businesses dominate since 2019.
          </p>
        </div>
      </div>
    </footer>
  );
}

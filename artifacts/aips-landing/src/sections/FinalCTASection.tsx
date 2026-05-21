import { motion } from "framer-motion";
import { ShoppingBag, Facebook, Instagram, Linkedin } from "lucide-react";
import { useLocation } from "wouter";
import { PrimaryBrandLogo } from "@/components/PrimaryBrandLogo";
import { PaymentBadges } from "@/components/PaymentBadges";

const WHATSAPP_LINK = "https://wa.me/8801865385348";
const SHOP_LINK = "https://aips-shop.pages.dev";

const FOOTER_COLS = [
  {
    title: "Products",
    links: [
      { label: "AI Assistant & Chat", href: "/ai-assistant" },
      { label: "AI Image & Design", href: "/ai-image" },
      { label: "AI Video", href: "/ai-video" },
      { label: "AI Voice & Music", href: "/ai-voice-music" },
      { label: "AI Code & Dev Tools", href: "/ai-code" },
      { label: "AI Workspace", href: "/ai-workspace" },
      { label: "Bundles", href: "/bundles" },
      { label: "All Products", href: "/products" },
    ],
  },
  {
    title: "Best AI For",
    links: [
      { label: "Students", href: "/#pain-points" },
      { label: "Freelancers", href: "/#pain-points" },
      { label: "Content Creators", href: "/#pain-points" },
      { label: "Business Owners", href: "/#pain-points" },
      { label: "Job Seekers", href: "/#pain-points" },
      { label: "Developers", href: "/#pain-points" },
      { label: "Designers", href: "/#pain-points" },
      { label: "Marketers", href: "/#pain-points" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "How to Order", href: "/#how-it-works" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Terms", href: "/terms" },
      { label: "WhatsApp", href: WHATSAPP_LINK, external: true },
    ],
  },
];

export function FinalCTASection() {
  const [, navigate] = useLocation();

  return (
    <>
      <section className="py-20 px-4" style={{ backgroundColor: "#0a0e27" }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl py-14 px-8 md:p-12 border border-[#f4b942]/20"
            style={{
              background: "linear-gradient(135deg, rgba(244,185,66,0.08) 0%, transparent 50%, rgba(244,185,66,0.08) 100%)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
              Start Today — From Just BDT 350
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto text-center text-gray-400">
              Join 10,000+ customers who trust AI Premium Shop.
            </p>
            <a
              href={SHOP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="final-cta"
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg mx-auto block mt-6 max-w-xs text-center flex items-center justify-center gap-2 transition-colors duration-200"
              style={{ boxShadow: "0 8px 30px rgba(37,211,102,0.25)" }}
            >
              <ShoppingBag className="w-5 h-5" />
              View Plans & Order
            </a>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <span className="text-sm text-gray-500">Pay with</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E2136E] text-white">bKash</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F6921E] text-white">Nagad</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#6e40c9] text-white">Rocket</span>
            </div>
          </motion.div>
        </div>
      </section>

      <footer
        className="pt-16 pb-8 px-4 border-t border-white/10"
        style={{ backgroundColor: "#080c1f" }}
        data-testid="footer"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <PrimaryBrandLogo size="small" layout="horizontal" />
              </div>
              <p className="text-xs leading-relaxed max-w-xs" style={{ color: "#c9ceda" }}>
                Premium AI subscriptions in Bangladesh. Fast delivery. Local payment. Real support.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://www.facebook.com/aipremiumshopbd" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                  aria-label="Facebook">
                  <Facebook className="w-4 h-4" style={{ color: "#c9ceda" }} />
                </a>
                <a href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                  aria-label="Instagram">
                  <Instagram className="w-4 h-4" style={{ color: "#c9ceda" }} />
                </a>
                <a href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors"
                  aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" style={{ color: "#c9ceda" }} />
                </a>
              </div>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <div className="font-semibold text-white text-sm mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs transition-colors hover:text-white"
                          style={{ color: "#c9ceda" }}
                        >
                          {link.label}
                        </a>
                      ) : link.href.includes("#") ? (
                        <a
                          href={link.href}
                          className="text-xs transition-colors hover:text-white"
                          style={{ color: "#c9ceda" }}
                        >
                          {link.label}
                        </a>
                      ) : (
                        <a
                          href={link.href}
                          onClick={(e) => { e.preventDefault(); navigate(link.href); }}
                          className="text-xs transition-colors hover:text-white"
                          style={{ color: "#c9ceda" }}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
            <PaymentBadges label="We accept" className="flex-wrap" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs" style={{ color: "#c9ceda" }}>
              <span>© 2022–{new Date().getFullYear()} AI Premium Shop, Dhaka, Bangladesh. All rights reserved.</span>
              <span>aipremiumshop.com</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

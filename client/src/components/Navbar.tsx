import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Sun, Moon, ShoppingBag, Heart, User, X, Menu, ChevronDown } from "lucide-react";

interface NavbarProps {
  onAuthOpen: () => void;
  onCartOpen: () => void;
  onSearchOpen?: () => void;
}

const NAV_LINKS = [
  { label: "New In", href: "/category/all" },
  { label: "Dark Blue", href: "/category/dark-blue" },
  { label: "Light Blue", href: "/category/light-blue" },
  { label: "Black", href: "/category/black" },
  { label: "Toddler", href: "/category/toddler" },
  { label: "About", href: "#about-us" },
];

export default function Navbar({ onAuthOpen, onCartOpen }: NavbarProps) {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annDismissed, setAnnDismissed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setScrolled(currentY > 20);
          // Hide nav when scrolling down past 80px, show when scrolling up
          if (currentY > 80) {
            setHidden(currentY > lastScrollY.current && currentY > 120);
          } else {
            setHidden(false);
          }
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* ── Announcement Bar ── */}
      {!annDismissed && (
        <div
          className="relative overflow-hidden text-xs font-medium tracking-wide py-2 transition-transform duration-300"
          style={{
            background: "var(--ann-bg)",
            color: "var(--ann-fg)",
            transform: hidden ? "translateY(-100%)" : "translateY(0)",
          }}
        >
          <div className="ticker-track flex whitespace-nowrap">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 px-4 shrink-0">
                <span>Free shipping on orders above ₹1,500</span>
                <span className="opacity-40">✦</span>
                <span>New Denim Collection 2025 — Just Landed</span>
                <span className="opacity-40">✦</span>
                <span>Premium Cotton-Lycra Stretch Denim</span>
                <span className="opacity-40">✦</span>
                <span>Easy 7-day returns</span>
                <span className="opacity-40">✦</span>
              </span>
            ))}
          </div>
          <button
            onClick={() => setAnnDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity z-10"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Main Navbar ── */}
      <header
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px) saturate(1.5)",
          WebkitBackdropFilter: "blur(20px) saturate(1.5)",
          borderBottom: `1px solid ${scrolled ? "var(--nav-border)" : "transparent"}`,
          boxShadow: scrolled ? "0 2px 20px oklch(0 0 0 / 0.06)" : "none",
          transform: hidden ? "translateY(-100%)" : "translateY(0)",
        }}
      >
        {/* ══════════════════════════════════════
            DESKTOP NAV (xl and above)
        ══════════════════════════════════════ */}
        <div className="hidden xl:flex container items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--foreground)" }}>
              ywee
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--ywee-sage)" }}>+</span>
          </a>

          {/* Desktop Links */}
          <nav className="flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-70 nav-link"
                style={{ color: "var(--foreground)" }}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </button>
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(v => !v); }}
                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors hover:bg-secondary"
                    style={{ borderColor: "var(--border)" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "var(--ywee-sage)" }}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden xl:block">{user.name.split(" ")[0]}</span>
                    <ChevronDown size={12} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border py-1 z-50"
                      style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                      </div>
                      <a href="/orders" className="block px-4 py-2 text-sm hover:bg-secondary transition-colors">My Orders</a>
                      <a href="#" className="block px-4 py-2 text-sm hover:bg-secondary transition-colors">Wishlist</a>
                      <button onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        style={{ color: "var(--destructive)" }}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={onAuthOpen}
                  className="p-2 rounded-full hover:bg-secondary transition-colors">
                  <User size={18} strokeWidth={1.8} />
                </button>
              )}
            </div>
            <button onClick={() => {}}
              className="p-2 rounded-full hover:bg-secondary transition-colors relative"
              aria-label="Wishlist">
              <Heart size={18} strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--ywee-sage)" }}>
                  {wishlistCount}
                </span>
              )}
            </button>
            <button onClick={onCartOpen}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "var(--foreground)", color: "var(--background)" }}>
              <ShoppingBag size={16} strokeWidth={2} />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "var(--ywee-sage)", color: "white" }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            MOBILE NAV (below xl)
            Layout: [ywee+ pill] ........... [theme|search|cart|☰ pill]
        ══════════════════════════════════════ */}
        <div className="xl:hidden flex items-center justify-between h-14 px-3 gap-3">
          {/* Left: ywee branding pill */}
          <a href="/"
            className="flex items-center gap-0.5 px-4 py-2 rounded-full text-sm font-bold shrink-0"
            style={{
              background: "var(--foreground)",
              color: "var(--background)",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.02em",
              fontSize: "15px",
            }}>
            ywee<span style={{ color: "var(--ywee-sage)", fontSize: "0.6rem", verticalAlign: "super" }}>+</span>
          </a>

          {/* Right: action pill — theme toggle | search | cart | hamburger */}
          <div
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-full shrink-0"
            style={{
              background: "var(--secondary)",
              border: "1px solid var(--border)",
            }}>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-border"
              style={{ color: "var(--foreground)" }}
              aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
            </button>
            {/* Divider */}
            <div style={{ width: "1px", height: "16px", background: "var(--border)", margin: "0 2px" }} />
            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-border relative"
              style={{ color: "var(--foreground)" }}
              aria-label="Cart">
              <ShoppingBag size={15} strokeWidth={2} />
              {totalItems > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ background: "var(--ywee-terracotta)", fontSize: "8px", fontWeight: 700 }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>
            {/* Divider */}
            <div style={{ width: "1px", height: "16px", background: "var(--border)", margin: "0 2px" }} />
            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-border"
              style={{ color: "var(--foreground)" }}
              aria-label="Menu">
              <Menu size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Full-Screen Menu ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: "var(--background)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--border)" }}>
            <span className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              ywee<span style={{ color: "var(--ywee-sage)" }}>+</span>
            </span>
            <button onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <a key={link.label} href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-4 text-xl font-medium border-b transition-colors hover:opacity-60"
                style={{
                  borderColor: "var(--border)",
                  animationDelay: `${i * 0.06}s`,
                  fontFamily: "'Playfair Display', serif",
                }}>
                {link.label}
                <span style={{ color: "var(--muted-foreground)" }}>→</span>
              </a>
            ))}
          </nav>
          <div className="px-6 py-6 border-t flex flex-col gap-3"
            style={{ borderColor: "var(--border)" }}>
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: "var(--ywee-sage)" }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{user.email}</p>
                  </div>
                </div>
                <a href="/orders" onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full text-sm font-semibold text-center border transition-all hover:bg-secondary"
                  style={{ borderColor: "var(--border)" }}>
                  My Orders
                </a>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-full text-sm font-semibold border transition-all hover:bg-secondary"
                  style={{ borderColor: "var(--border)", color: "var(--destructive)" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => { onAuthOpen(); setMobileMenuOpen(false); }}
                className="w-full py-3 rounded-full text-sm font-semibold transition-all"
                style={{ background: "var(--foreground)", color: "var(--background)" }}>
                Sign In / Create Account
              </button>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
              <button onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors hover:bg-secondary"
                style={{ borderColor: "var(--border)" }}>
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

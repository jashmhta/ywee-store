import { useState, useEffect, useRef } from "react";
import { Home, ShoppingBag, Package, User, Grid3X3 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface MobileBottomNavProps {
  onCartOpen: () => void;
  onSearchOpen?: () => void;
  onAuthOpen: () => void;
}

export default function MobileBottomNav({ onCartOpen, onAuthOpen }: MobileBottomNavProps) {
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [visible, setVisible] = useState(true);
  const [pastHero, setPastHero] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show when scroll stops, hide while scrolling
  useEffect(() => {
    const onScroll = () => {
      setPastHero(window.scrollY > 20);
      setVisible(false);
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        setVisible(true);
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(scrollTimer.current);
    };
  }, []);

  const items = [
    { icon: Home, label: "Home", onClick: () => window.location.href = "/" },
    { icon: Grid3X3, label: "Shop", onClick: () => window.location.href = "/category/all" },
    { icon: ShoppingBag, label: "Cart", onClick: onCartOpen, badge: totalItems },
    { icon: Package, label: "Orders", onClick: () => window.location.href = "/orders" },
    { icon: User, label: "Account", onClick: onAuthOpen },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] border-t bottom-nav-safe transition-all duration-300"
      style={{
        background: pastHero ? "var(--nav-bg)" : "var(--card)",
        backdropFilter: pastHero ? "blur(20px) saturate(1.5)" : "none",
        WebkitBackdropFilter: pastHero ? "blur(20px) saturate(1.5)" : "none",
        borderColor: "var(--border)",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isCenter = i === 2;
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`flex flex-col items-center gap-1 relative transition-all active:scale-90 ${
                isCenter ? "relative -top-4" : ""
              }`}
            >
              {isCenter ? (
                <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95"
                  style={{ background: "var(--foreground)" }}>
                  <Icon size={22} strokeWidth={2} style={{ color: "var(--background)" }} />
                  {(item.badge ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                      style={{ background: "var(--ywee-sage)" }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <div className="relative p-2">
                    <Icon size={20} strokeWidth={1.8} style={{ color: "var(--foreground)" }} />
                    {(item.badge ?? 0) > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                        style={{ background: "var(--ywee-sage)" }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

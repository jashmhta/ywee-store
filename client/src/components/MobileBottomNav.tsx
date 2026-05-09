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
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          // Hide when scrolling down, show when scrolling up
          if (currentY > 80) {
            setHidden(currentY > lastScrollY.current);
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

  const items = [
    { icon: Home, label: "Home", onClick: () => window.location.href = "/" },
    { icon: Grid3X3, label: "Shop", onClick: () => window.location.href = "/category/all" },
    { icon: ShoppingBag, label: "Cart", onClick: onCartOpen, badge: totalItems },
    { icon: Package, label: "Orders", onClick: () => window.location.href = "/orders" },
    { icon: User, label: "Account", onClick: onAuthOpen },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] border-t bottom-nav-safe transition-transform duration-300"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(20px) saturate(1.5)",
        WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        borderColor: "var(--border)",
        transform: hidden ? "translateY(100%)" : "translateY(0)",
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

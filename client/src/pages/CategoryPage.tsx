import { useRoute, useLocation } from "wouter";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { PRODUCTS, CATEGORIES, formatINR } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";

const AGE_FILTERS = [
  { id: "all", label: "All Ages" },
  { id: "toddler", label: "1–4Y" },
  { id: "little-girls", label: "4–8Y" },
  { id: "big-girls", label: "8–14Y" },
];

const COLOR_FILTERS = [
  { id: "all", label: "All Colors" },
  { id: "dark-blue", label: "Dark Blue" },
  { id: "light-blue", label: "Light Blue" },
  { id: "black", label: "Black" },
];

export default function CategoryPage() {
  const [, params] = useRoute("/category/:id");
  const [, navigate] = useLocation();
  const categoryId = params?.id ?? "all";
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ageFilter, setAgeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "rating">("default");

  const category = CATEGORIES.find(c => c.id === categoryId);
  const categoryName = category?.label ?? "All Styles";

  let products = categoryId === "all"
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => {
        if (categoryId === "dark-blue" || categoryId === "light-blue" || categoryId === "black") {
          return p.colour?.toLowerCase().includes(categoryId.replace("-", " "));
        }
        if (categoryId === "toddler") return p.ageCategory === "toddler";
        if (categoryId === "little-girls") return p.ageCategory === "little-girls";
        if (categoryId === "big-girls") return p.ageCategory === "big-girls";
        return p.category === categoryId;
      });

  if (ageFilter !== "all") {
    products = products.filter(p => p.ageCategory === ageFilter);
  }

  if (sortBy === "price-low") products.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-high") products.sort((a, b) => b.price - a.price);
  else if (sortBy === "rating") products.sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar
        onAuthOpen={() => setAuthOpen(true)}
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => {}}
      />

      {/* Hero banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden" style={{ background: "var(--secondary)" }}>
        {category?.image && (
          <img src={category.image} alt={categoryName} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--background) 0%, transparent 60%)" }} />
        <div className="container relative h-full flex flex-col justify-end pb-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-xs mb-3 hover:opacity-70 transition-opacity w-fit"
            style={{ color: "var(--muted-foreground)" }}>
            <ArrowLeft size={12} /> Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {categoryName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {category?.ageRange ?? "Ages 1–14"} · {products.length} styles
          </p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="container py-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal size={14} style={{ color: "var(--muted-foreground)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>Age:</span>
          </div>
          {AGE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setAgeFilter(f.id)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={{
                background: ageFilter === f.id ? "var(--foreground)" : "transparent",
                color: ageFilter === f.id ? "var(--background)" : "var(--foreground)",
                borderColor: ageFilter === f.id ? "var(--foreground)" : "var(--border)",
              }}>
              {f.label}
            </button>
          ))}
          <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border bg-transparent cursor-pointer"
            style={{ borderColor: "var(--border)" }}>
            <option value="default">Sort: Featured</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product grid */}
      <div className="container pb-16">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2">No products found</p>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onQuickView={() => navigate(`/product/${p.id}`)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthOpen={() => setAuthOpen(true)} />
      <MobileBottomNav
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => {}}
        onAuthOpen={() => setAuthOpen(true)}
      />
    </div>
  );
}

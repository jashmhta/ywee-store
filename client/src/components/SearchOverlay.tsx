import { useState, useEffect, useRef } from "react";
import { X, Search, TrendingUp } from "lucide-react";
import { PRODUCTS, formatINR } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const TRENDING = ["Floral Dress", "Linen Shirt", "Baby Romper", "Organic Cotton", "New In SS'24"];

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); }
    else { setQuery(""); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = query.trim().length > 1
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[180] flex flex-col"
      style={{ background: "var(--background)" }}>
      {/* Search bar */}
      <div className="flex items-center gap-4 px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Search size={20} strokeWidth={1.8} style={{ color: "var(--muted-foreground)" }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for products, categories..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 text-lg bg-transparent outline-none"
          style={{ color: "var(--foreground)" }}
        />
        <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {query.trim().length < 2 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--muted-foreground)" }}>
              Trending Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(t => (
                <button key={t} onClick={() => setQuery(t)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-colors hover:bg-secondary"
                  style={{ borderColor: "var(--border)" }}>
                  <TrendingUp size={13} style={{ color: "var(--ywee-sage)" }} />
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-semibold">No results for "{query}"</p>
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>Try a different search term</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--muted-foreground)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map(product => (
                <div key={product.id} className="rounded-2xl overflow-hidden border transition-all hover:shadow-lg"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <div className="aspect-square overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm leading-tight">{product.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{product.ageRange}</p>
                    <p className="font-bold text-sm mt-1">{formatINR(product.price)}</p>
                    <button
                      onClick={() => {
                        addItem({ id: product.id, name: product.name, price: product.price, image: product.image, size: product.sizes[2] || product.sizes[0], color: "Natural", category: product.category });
                        toast.success(`${product.name} added to cart!`);
                        onClose();
                      }}
                      className="w-full mt-2 py-2 rounded-full text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: "var(--foreground)", color: "var(--background)" }}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

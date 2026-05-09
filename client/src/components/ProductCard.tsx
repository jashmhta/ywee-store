import { useState } from "react";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { Product, formatINR } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const SWATCH_MAP: Record<string, string> = {
  "Dark Blue": "#1a3a5c",
  "Light Blue": "#7ab3d3",
  "Black": "#1a1a1a",
  "Blue": "#2563eb",
  "White": "#f5f5f5",
  "Grey": "#9ca3af",
};

const PLACEHOLDER_SVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI2NiIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTFhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==`;

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [, navigate] = useLocation();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [heartAnim, setHeartAnim] = useState(false);
  const [addAnim, setAddAnim] = useState(false);
  const [imgError, setImgError] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id, selectedSize);
  const selectedColor = product.colors[selectedColorIdx] || "Default";

  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;

  const visibleSizes = product.sizes.slice(0, 3);
  const extraSizes = product.sizes.length - 3;

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", { duration: 1500 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
      category: product.category,
    });
    setAddAnim(true);
    setTimeout(() => setAddAnim(false), 600);
    toast.success(`${product.name} added!`, { description: `Size ${selectedSize}`, duration: 2000 });
  };

  return (
    <div
      className="product-card-hover rounded-2xl overflow-hidden border flex flex-col group h-full"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "3/4", flexShrink: 0, background: "var(--secondary)" }}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={imgError ? PLACEHOLDER_SVG : product.image || PLACEHOLDER_SVG}
          alt={product.name}
          width={300}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
        {/* Desktop hover overlay */}
        <div
          className="absolute inset-0 hidden sm:flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.45) 0%, transparent 55%)" }}
        >
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${addAnim ? "scale-95" : "hover:opacity-90"}`}
              style={{ background: inCart ? "var(--ywee-sage)" : "var(--foreground)", color: "var(--background)" }}
            >
              <ShoppingBag size={12} />
              {inCart ? "In Cart" : "Add to Cart"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shrink-0"
              style={{ background: "var(--card)" }}
              aria-label="View product"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 pointer-events-none">
          {product.badge && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-white leading-tight"
              style={{
                background: product.badge === "New In" ? "var(--ywee-sage)"
                  : product.badge === "Sale" ? "var(--ywee-terracotta)"
                  : "var(--ywee-brown)",
              }}
            >
              {product.badge}
            </span>
          )}
          {discountPct && discountPct > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold text-white leading-tight"
              style={{ background: "var(--ywee-terracotta)" }}
            >
              -{discountPct}%
            </span>
          )}
        </div>
        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-all ${heartAnim ? "heart-pop" : "hover:scale-110"}`}
          style={{ background: "oklch(1 0 0 / 0.92)" }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} strokeWidth={1.8}
            style={{ color: wishlisted ? "#e11d48" : "#374151", fill: wishlisted ? "#e11d48" : "none" }} />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5 sm:p-3.5 flex flex-col gap-1 sm:gap-1.5 flex-1">
        <p
          className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </p>
        <p className="text-[10px] leading-none" style={{ color: "var(--muted-foreground)" }}>
          {product.ageRange}
        </p>
        {product.reviews > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9}
                  fill={i < Math.floor(product.rating) ? "var(--ywee-gold)" : "none"}
                  style={{ color: "var(--ywee-gold)" }} />
              ))}
            </div>
            <span className="text-[9px] sm:text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              ({product.reviews})
            </span>
          </div>
        )}
        {product.colors.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {product.colors.map((c, i) => {
              const hex = SWATCH_MAP[c] || "#888";
              return (
                <button key={i} onClick={() => setSelectedColorIdx(i)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all hover:scale-110 shrink-0"
                  style={{
                    background: hex,
                    boxShadow: selectedColorIdx === i
                      ? `0 0 0 1.5px var(--background), 0 0 0 3px var(--foreground)`
                      : `0 0 0 1px var(--border)`,
                  }}
                  title={c} aria-label={`Select ${c}`} />
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mt-auto pt-0.5">
          {visibleSizes.map((size) => (
            <button key={size} onClick={() => setSelectedSize(size)}
              className={`size-btn px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium transition-all ${selectedSize === size ? "selected" : ""}`}>
              {size}
            </button>
          ))}
          {extraSizes > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] self-center font-medium" style={{ color: "var(--muted-foreground)" }}>
              +{extraSizes} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-xs sm:text-sm">{formatINR(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs line-through" style={{ color: "var(--muted-foreground)" }}>
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>
          <button onClick={handleAddToCart}
            className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center transition-all shrink-0 ${addAnim ? "scale-90" : "hover:scale-110"}`}
            style={{ background: inCart ? "var(--ywee-sage)" : "var(--foreground)", color: "var(--background)" }}
            aria-label="Add to cart">
            <ShoppingBag size={13} />
          </button>
        </div>
        <button onClick={handleAddToCart}
          className={`sm:hidden w-full py-2 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all mt-1 ${addAnim ? "scale-95" : "active:scale-95"}`}
          style={{ background: inCart ? "var(--ywee-sage)" : "var(--foreground)", color: "var(--background)" }}>
          <ShoppingBag size={11} />
          {inCart ? "In Cart" : "Add"}
        </button>
      </div>
    </div>
  );
}

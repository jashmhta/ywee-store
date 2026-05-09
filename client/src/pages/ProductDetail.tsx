import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Star, Heart, Share2, Shield, Truck, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { PRODUCTS, formatINR, type Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const [, navigate] = useLocation();
  const productId = params?.id;
  const product = PRODUCTS.find(p => p.id === productId);

  const { addItem, isInCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[2] || product.sizes[0]);
      setSelectedColor(0);
      setCurrentImage(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [productId, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">Product not found</p>
          <button onClick={() => navigate("/")} className="px-6 py-3 rounded-full text-sm font-bold"
            style={{ background: "var(--foreground)", color: "var(--background)" }}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image, product.image, product.image];
  const inCart = isInCart(product.id, selectedSize);
  const relatedProducts = PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.ageRange === product.ageRange)).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize,
        color: product.colors[selectedColor] || "Natural",
        category: product.category,
      });
    }
    toast.success(`${product.name} added to cart!`, {
      description: `Size ${selectedSize} · ${product.colors[selectedColor] || "Natural"} · Qty ${quantity}`,
    });
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar
        onAuthOpen={() => setAuthOpen(true)}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* Breadcrumb */}
      <div className="container pt-24 pb-4">
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <button onClick={() => navigate("/")} className="hover:opacity-70 transition-opacity flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </button>
          <span>/</span>
          <span className="capitalize">{product.category === "newin" ? "New In" : product.category}</span>
          <span>/</span>
          <span style={{ color: "var(--foreground)" }}>{product.name}</span>
        </div>
      </div>

      {/* Main product section */}
      <div className="container pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ── IMAGE GALLERY ── */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className="shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: currentImage === i ? "var(--foreground)" : "var(--border)",
                    opacity: currentImage === i ? 1 : 0.6,
                  }}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative flex-1 rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4", background: "var(--secondary)" }}>
              <img
                src={images[currentImage]}
                alt={product.name}
                width={600}
                height={800}
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: product.badge === "New In" ? "var(--ywee-sage)" : product.badge === "Sale" ? "#E07B54" : "var(--ywee-brown)" }}>
                    {product.badge}
                    {discount && ` -${discount}%`}
                  </span>
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{ background: "oklch(1 0 0 / 0.9)" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                    style={{ background: "oklch(1 0 0 / 0.9)" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {/* Wishlist */}
              <button
                onClick={() => setWishlist(v => !v)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                style={{ background: "oklch(1 0 0 / 0.9)" }}
              >
                <Heart size={16} fill={wishlist ? "#E07B54" : "none"} style={{ color: wishlist ? "#E07B54" : "var(--foreground)" }} />
              </button>
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="flex flex-col gap-5">
            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--ywee-sage)" }}>
                {product.ageRange} · {product.category === "newin" ? "New In" : product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {product.name}
              </h1>
              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "var(--ywee-gold)" : "none"}
                      style={{ color: "var(--ywee-gold)" }} />
                  ))}
                </div>
                <span className="text-sm font-semibold">{product.rating}</span>
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg line-through" style={{ color: "var(--muted-foreground)" }}>
                    {formatINR(product.originalPrice)}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "#E07B54" }}>
                    Save {formatINR(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {product.description}
            </p>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3">
                  Color: <span className="normal-case font-normal" style={{ color: "var(--muted-foreground)" }}>
                    {product.colors[selectedColor]}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color, i) => {
                    const swatchMap: Record<string, string> = {
                      'Dark Blue': '#1a3a5c',
                      'Light Blue': '#7ab3d3',
                      'Black': '#1a1a1a',
                      'Blue': '#2563eb',
                    };
                    const bg = swatchMap[color] || '#888';
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        title={color}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          background: bg,
                          borderColor: selectedColor === i ? "var(--foreground)" : "transparent",
                          boxShadow: selectedColor === i ? "0 0 0 2px var(--background), 0 0 0 4px var(--foreground)" : "0 0 0 1px var(--border)",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest">Size</p>
                <button className="text-xs underline" style={{ color: "var(--ywee-sage)" }}>Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background: selectedSize === size ? "var(--foreground)" : "transparent",
                      color: selectedSize === size ? "var(--background)" : "var(--foreground)",
                      borderColor: selectedSize === size ? "var(--foreground)" : "var(--border)",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 items-center">
              {/* Quantity */}
              <div className="flex items-center gap-2 border rounded-xl px-3 py-2" style={{ borderColor: "var(--border)" }}>
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                  <Minus size={12} />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                  <Plus size={12} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{
                  background: inCart ? "var(--ywee-sage)" : "var(--foreground)",
                  color: "var(--background)",
                }}
              >
                <ShoppingBag size={16} />
                {inCart ? "Added to Cart ✓" : "Add to Cart"}
              </button>

              {/* Share */}
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="w-12 h-12 rounded-xl border flex items-center justify-center transition-all hover:bg-secondary"
                style={{ borderColor: "var(--border)" }}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders above ₹1,500" },
                { icon: RotateCcw, label: "Easy Returns", sub: "14-day return policy" },
                { icon: Shield, label: "100% Organic", sub: "GOTS Certified" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl gap-1.5"
                  style={{ background: "var(--secondary)" }}>
                  <Icon size={18} strokeWidth={1.5} style={{ color: "var(--ywee-sage)" }} />
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
                </div>
              ))}
            </div>

            {/* Material & Care */}
            {product.material && (
              <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between py-2 text-sm border-b" style={{ borderColor: "var(--border)" }}>
                  <span className="font-medium">Material</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{product.material}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-medium">Care</span>
                  <span style={{ color: "var(--muted-foreground)" }}>Machine wash cold, tumble dry low</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--ywee-sage)" }}>
                You may also like
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Complete the look
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} onQuickView={() => navigate(`/product/${p.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals & Drawers ── */}
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

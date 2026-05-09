import { useState, useRef, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Leaf, Heart, Shield, RotateCcw, Plus, Minus, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import CartDrawer from "@/components/CartDrawer";
import MobileBottomNav from "@/components/MobileBottomNav";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES, TESTIMONIALS, FAQS, formatINR, type Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { useReveal, useCountUp } from "@/hooks/useReveal";
import { toast } from "sonner";

// ── Quick View Modal ──────────────────────────────────────────────────────────
function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem, isInCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[2] || product.sizes[0]);
  const inCart = isInCart(product.id, selectedSize);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--card)" }}>
        <div className="grid sm:grid-cols-2">
          <div className="aspect-[4/3] sm:aspect-auto sm:h-96 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div>
              {product.badge && (
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold text-white mb-2"
                  style={{ background: product.badge === "New In" ? "var(--ywee-sage)" : "var(--ywee-brown)" }}>
                  {product.badge}
                </span>
              )}
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h3>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{product.ageRange}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "var(--ywee-gold)" : "none"}
                      style={{ color: "var(--ywee-gold)" }} />
                  ))}
                </div>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>({product.reviews} reviews)</span>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold">{formatINR(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm line-through" style={{ color: "var(--muted-foreground)" }}>
                  {formatINR(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{product.description}</p>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`size-btn px-3 py-1.5 rounded-lg text-xs font-medium ${selectedSize === size ? "selected" : ""}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                addItem({ id: product.id, name: product.name, price: product.price, image: product.image, size: selectedSize, color: "Natural", category: product.category });
                toast.success(`${product.name} added!`, { description: `Size ${selectedSize}` });
                onClose();
              }}
              className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 mt-auto"
              style={{ background: inCart ? "var(--ywee-sage)" : "var(--foreground)", color: "var(--background)" }}>
              {inCart ? "✓ In Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Video Card (age category) ─────────────────────────────────────────────────
function VideoCard({ cat }: { cat: (typeof CATEGORIES)[number] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) videoRef.current?.play().catch(() => {});
        else { videoRef.current?.pause(); }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className="video-card relative shrink-0 w-full sm:w-72 h-[80vw] sm:h-96 max-h-[500px] rounded-2xl overflow-hidden cursor-pointer group"
      style={{ background: "var(--secondary)" }}>
      {cat.video ? (
        <video
          ref={videoRef}
          src={cat.video}
          poster={cat.image}
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover" />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to top, oklch(0 0 0 / 0.65) 0%, transparent 55%)" }} />
      {/* Play indicator */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity"
        style={{ background: "oklch(1 0 0 / 0.3)" }}>
        <Play size={12} fill="white" style={{ color: "white" }} />
      </div>
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>{cat.label}</p>
        <p className="text-white/70 text-xs mt-0.5">{cat.ageRange}</p>
        <button className="mt-3 flex items-center gap-1.5 text-white text-xs font-semibold border border-white/40 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
          Shop Now <ArrowRight size={11} />
        </button>
      </div>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:opacity-70 transition-opacity"
      >
        <span className="font-medium text-sm sm:text-base">{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-transform duration-300"
          style={{ borderColor: "var(--border)", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>
          <Plus size={14} />
        </span>
      </button>
      <div className={`faq-content ${open ? "open" : ""}`}>
        <p className="text-sm leading-relaxed pb-5" style={{ color: "var(--muted-foreground)" }}>{a}</p>
      </div>
    </div>
  );
}

// ── Main Home Page ────────────────────────────────────────────────────────────
export default function Home() {
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
   const [collectionSlide, setCollectionSlide] = useState(0);
  const ageWrapperRef = useRef<HTMLDivElement>(null);
  const ageTrackRef = useRef<HTMLDivElement>(null);

  // Awwward-style pinned horizontal scroll for Shop by Age
  useEffect(() => {
    const wrapper = ageWrapperRef.current;
    const track = ageTrackRef.current;
    if (!wrapper || !track) return;

    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const viewportH = window.innerHeight;
      const scrolled = Math.max(0, -rect.top) / (wrapperHeight - viewportH);
      const progress = Math.min(1, Math.max(0, scrolled));
      const trackWidth = track.scrollWidth - window.innerWidth;
      track.style.transform = `translateX(-${progress * trackWidth}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate collection every 4s
  useEffect(() => {
    const t = setInterval(() => setCollectionSlide(i => (i + 1) % 3), 4000);
    return () => clearInterval(t);
  }, []);

  const heroReveal = useReveal();
  const trustReveal = useReveal();
  const collectionReveal = useReveal();
  const productsReveal = useReveal();
  const lookbookReveal = useReveal();
  const sustainReveal = useReveal();
  const testiReveal = useReveal();
  const faqReveal = useReveal();
  const aboutReveal = useReveal();
  const funReveal = useReveal();
  const newsletterReveal = useReveal();

  const stat1 = useCountUp(11); // 11+ styles
  const stat2 = useCountUp(14); // ages 1-14
  const stat3 = useCountUp(0); // unused

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredProducts = activeFilter === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeFilter);

  const COLLECTION_SLIDES = [
    { tag: "DARK BLUE COLLECTION", heading: "Bold denim for bold girls", sub: "Premium stretch denim jeans with fun prints — from toddler sass to tween class.", image: "/manus-storage/ywee-collection-banner1.png" },
    { tag: "LIGHT BLUE COLLECTION", heading: "Soft, stretchy & so stylish", sub: "Light blue denim that moves with your little one — perfect for every adventure.", image: "/manus-storage/ywee-collection-banner2.png" },
    { tag: "TODDLER COLLECTION", heading: "Tiny jeans, big personality", sub: "Adorable stretch denim for girls aged 1-4 — soft, comfortable and oh-so-cute.", image: "/manus-storage/ywee-collection-banner3.png" },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Welcome to the ywee family!", { description: "Check your inbox for 10% off your first order." });
  };

  // Scroll progress bar
  useEffect(() => {
    const bar = document.getElementById('scroll-progress');
    const onScroll = () => {
      if (!bar) return;
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      bar.style.width = `${scrolled}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen pb-20 lg:pb-0" style={{ background: "var(--background)" }}>
      {/* Scroll progress bar */}
      <div id="scroll-progress" />
      <Navbar onAuthOpen={() => setAuthOpen(true)} onCartOpen={() => setCartOpen(true)} />

      {/* ── HERO ── */}
      <section ref={heroReveal} className="relative overflow-hidden"
        style={{ height: "calc(100svh - 88px)", minHeight: 480, maxHeight: 920 }}>
        {/* Full-bleed video */}
        <video
          src="/manus-storage/ywee-hero-video.mp4"
          autoPlay muted loop playsInline
          poster="/manus-storage/ywee-hero-keyframe1.png"
          className="absolute inset-0 w-full h-full object-cover object-center sm:object-right"
          preload="metadata"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 z-[1]" style={{
          background: "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.05) 100%)"
        }} />
        <div className="relative z-[2] h-full flex items-center">
          <div className="container">
            <div className="max-w-lg">
              <p className="hero-text-item text-xs font-semibold uppercase tracking-widest mb-3 sm:mb-4"
                style={{ color: "oklch(0.82 0.12 142)" }}>Girls' Denim Collection 2025</p>
              <h1 className="hero-text-item text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] mb-4 sm:mb-5"
                style={{ fontFamily: "'Playfair Display', serif", color: "#fff" }}>
                Bold denim<br />
                <em className="not-italic" style={{ color: "var(--ywee-gold)" }}>for bold</em><br />
                girls
              </h1>
              <p className="hero-text-item text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs"
                style={{ color: "rgba(255,255,255,0.88)" }}>
                Premium stretch denim jeans for girls aged 1–14. Made in India with love.
              </p>
              <div className="hero-text-item flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                <a href="#shop" className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: "#fff", color: "#1a1a1a" }}>
                  Shop New In <ArrowRight size={15} />
                </a>
                <a href="#collections" className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-sm font-bold border transition-all hover:bg-white/10"
                  style={{ borderColor: "rgba(255,255,255,0.6)", color: "#fff" }}>
                  Explore Collections
                </a>
              </div>
              <div className="hero-text-item flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["/manus-storage/avatar1.jpg", "/manus-storage/avatar2.jpg", "/manus-storage/avatar3.jpg"].map((src, i) => (
                    <img key={i} src={src} alt="Parent" width={32} height={32} className="w-8 h-8 rounded-full border-2 object-cover"
                      decoding="async" loading="eager"
                      style={{ borderColor: "rgba(255,255,255,0.5)" }} />
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="var(--ywee-gold)" style={{ color: "var(--ywee-gold)" }} />)}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.85)" }}>Loved by 50K+ families</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Floating decorative SVG leaves */}
        <div className="absolute top-1/4 right-[8%] hidden lg:block float-slow" style={{ opacity: 0.35 }}>
          <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
            <path d="M24 2 C24 2 44 18 44 34 C44 50 34 58 24 58 C14 58 4 50 4 34 C4 18 24 2 24 2Z" fill="var(--ywee-sage)" />
            <line x1="24" y1="8" x2="24" y2="56" stroke="oklch(1 0 0 / 0.4)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute top-1/3 right-[15%] hidden lg:block float-medium" style={{ opacity: 0.25, animationDelay: '1.5s' }}>
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
            <path d="M16 2 C16 2 30 14 30 24 C30 34 24 38 16 38 C8 38 2 34 2 24 C2 14 16 2 16 2Z" fill="var(--ywee-brown)" />
          </svg>
        </div>
        {/* Sustainable badge */}
        <div className="absolute bottom-8 right-8 w-24 h-24 hidden sm:flex">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full" style={{ background: "oklch(1 0 0 / 0.12)", backdropFilter: "blur(8px)" }} />
            <svg viewBox="0 0 100 100" className="w-full h-full spin-slow absolute inset-0">
              <path id="circle-path" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
              <text fontSize="10" fontWeight="700" letterSpacing="3.5" style={{ fill: "var(--foreground)" }}>
                <textPath href="#circle-path">MADE IN INDIA · STRETCH DENIM · PREMIUM ·</textPath>
              </text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf size={22} style={{ color: "var(--ywee-sage)" }} />
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 scroll-bounce">
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5"
            style={{ borderColor: "var(--foreground)" }}>
            <div className="w-1 h-2 rounded-full" style={{ background: "var(--foreground)" }} />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section ref={trustReveal} className="py-4 px-4">
        <div className="max-w-5xl mx-auto rounded-2xl border px-3 sm:px-6 py-4 sm:py-5"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 sm:divide-x"
            style={{ borderColor: "var(--border)" }}>
            {[
              { icon: Leaf, label: "Stretch Denim", sub: "Moves with her all day" },
              { icon: Heart, label: "Made in India", sub: "Proudly crafted locally" },
              { icon: Shield, label: "Premium Quality", sub: "Durable denim that lasts" },
              { icon: RotateCcw, label: "Easy Returns", sub: "7-day hassle-free" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="reveal flex items-center gap-2 sm:gap-3 sm:px-6 min-w-0 p-1.5 sm:p-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--secondary)" }}>
                  <Icon size={14} strokeWidth={1.8} style={{ color: "var(--ywee-sage)" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold leading-tight truncate">{label}</p>
                  <p className="text-[9px] sm:text-[11px] leading-tight mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY AGE (Video Cards) ── */}
      {/* Mobile: snap scroll */}
      <section className="sm:hidden pt-10 pb-6">
        <div className="container mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--ywee-sage)" }}>Shop by Age</p>
          <h2 className="text-3xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Find the perfect fit
          </h2>
        </div>
        <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          <div className="flex" style={{ width: `${CATEGORIES.length * 100}vw` }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="snap-center snap-always flex-shrink-0" style={{ width: '100vw', paddingLeft: 24, paddingRight: 24 }}>
                <VideoCard cat={cat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop: awwward-style pinned horizontal scroll */}
      <div id="shop" ref={ageWrapperRef} className="hidden sm:block relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          <div className="container mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--ywee-sage)" }}>Shop by Age</p>
            <h2 className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Find the perfect fit
            </h2>
          </div>
          <div ref={ageTrackRef} className="flex gap-5 pl-8 pr-8 will-change-transform"
            style={{ width: "max-content" }}>
            {CATEGORIES.map((cat) => (
              <VideoCard key={cat.id} cat={cat} />
            ))}
          </div>
        </div>
      </div>

      {/* ── COLLECTION SLIDER ── */}
      <section id="collections" ref={collectionReveal} className="py-8 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border relative"
          style={{ borderColor: "var(--border)" }}>
          {COLLECTION_SLIDES.map((slide, i) => (
            <div key={i}
              className="transition-opacity duration-700"
              style={{ opacity: collectionSlide === i ? 1 : 0, position: collectionSlide === i ? "relative" : "absolute", inset: 0, pointerEvents: collectionSlide === i ? "auto" : "none", zIndex: collectionSlide === i ? 1 : 0 }}
            >
              <div className="flex flex-col md:grid md:grid-cols-2">
                <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center" style={{ background: "var(--card)" }}>
                  <p className="reveal text-xs font-semibold uppercase tracking-widest mb-4"
                    style={{ color: "var(--ywee-sage)" }}>{slide.tag}</p>
                  <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold leading-tight mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {slide.heading}
                  </h2>
                  <p className="reveal reveal-delay-2 text-sm leading-relaxed mb-8"
                    style={{ color: "var(--muted-foreground)" }}>{slide.sub}</p>
                  <a href="#shop" className="reveal reveal-delay-3 inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 self-start"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    Discover Collection <ArrowRight size={15} />
                  </a>
                </div>
                <div className="h-56 sm:h-72 md:h-auto md:min-h-80 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.heading}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          ))}
          {/* Dots + arrows */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            {COLLECTION_SLIDES.map((_, i) => (
              <button key={i} onClick={() => setCollectionSlide(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: collectionSlide === i ? 24 : 6,
                  height: 6,
                  background: collectionSlide === i ? "var(--foreground)" : "var(--border)",
                }} />
            ))}
          </div>
          {/* No manual arrows — auto-rotates every 4s */}
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section ref={productsReveal} className="py-12 sm:py-16">
        <div className="container mb-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="reveal text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "var(--ywee-sage)" }}>Best Sellers</p>
              <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Loved by little ones
              </h2>
            </div>
            <a href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity">
              View All <ArrowRight size={14} />
            </a>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: "all", label: "All Styles" },
              { id: "dark-blue", label: "Dark Blue" },
              { id: "light-blue", label: "Light Blue" },
              { id: "black", label: "Black" },
              { id: "jeans", label: "New In" },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeFilter === f.id ? "var(--foreground)" : "var(--secondary)",
                  color: activeFilter === f.id ? "var(--background)" : "var(--foreground)",
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {/* Products horizontal scroll */}
        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-3 sm:gap-5" style={{ width: "max-content" }}>
            {filteredProducts.slice(0, 12).map(p => (
              <div key={p.id} className="w-[160px] sm:w-[220px] md:w-[240px] shrink-0">
                <ProductCard product={p} onQuickView={setQuickViewProduct} />
              </div>
            ))}
          </div>
        </div>
        {filteredProducts.length > 12 && (
          <div className="container mt-8 text-center">
            <a href="#" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold border transition-all hover:bg-secondary"
              style={{ borderColor: "var(--border)" }}>
              View All {filteredProducts.length} Products <ArrowRight size={14} />
            </a>
          </div>
        )}
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="px-4 py-6">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ background: "var(--ywee-sage)" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 px-5 sm:px-12 py-7 sm:py-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-white/70">Limited Time</p>
              <h3 className="text-xl sm:text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Get 10% off your first order
              </h3>
              <p className="text-white/80 text-sm mt-1">Use code <strong className="text-white">WELCOME10</strong> at checkout</p>
            </div>
            <button
              onClick={() => setAuthOpen(true)}
              className="promo-pulse shrink-0 px-7 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "white", color: "var(--ywee-sage)" }}>
              Claim Offer →
            </button>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: "white" }} />
          <div className="absolute -left-3 -bottom-5 w-20 h-20 rounded-full opacity-10 pointer-events-none" style={{ background: "white" }} />
        </div>
      </section>

      {/* ── LOOKBOOK ── */}
      <section id="lookbook" ref={lookbookReveal} className="py-12 sm:py-16">
        <div className="container mb-8 flex items-end justify-between">
          <div>
            <p className="reveal text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--ywee-sage)" }}>YWEE Lookbook 2025</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Denim in every mood
            </h2>
          </div>
          <a href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:opacity-70 transition-opacity">
            View All <ArrowRight size={14} />
          </a>
        </div>
        <div className="container">
          {/* Desktop: asymmetric 3-col grid */}
          <div className="hidden md:grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "260px 260px" }}>
            <div className="lookbook-item row-span-2 rounded-2xl overflow-hidden">
              <img src="/manus-storage/ywee-enhanced-light-blue.png" alt="Light Blue Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="lookbook-item col-span-2 rounded-2xl overflow-hidden">
              <img src="/manus-storage/ywee-enhanced-floral-dark.png" alt="Floral Dark Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="lookbook-item rounded-2xl overflow-hidden">
              <img src="/manus-storage/ywee-enhanced-black-love.png" alt="Black Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="lookbook-item rounded-2xl overflow-hidden">
              <img src="/manus-storage/ywee-enhanced-dark-solid.png" alt="Dark Solid Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          </div>
          {/* Mobile: 2-col */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            <div className="lookbook-item col-span-2 rounded-2xl overflow-hidden aspect-video">
              <img src="/manus-storage/ywee-enhanced-floral-dark.png" alt="Floral Dark Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="lookbook-item rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="/manus-storage/ywee-enhanced-light-blue.png" alt="Light Blue Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="lookbook-item rounded-2xl overflow-hidden aspect-[3/4]">
              <img src="/manus-storage/ywee-enhanced-black-love.png" alt="Black Denim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SUSTAINABILITY ── */}
      <section id="about" ref={sustainReveal} className="px-4 py-4 mb-8">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: "var(--foreground)", color: "var(--background)" }}>
          <div className="flex flex-col md:grid md:grid-cols-2 gap-0">
            <div className="p-6 sm:p-10 md:p-14 flex flex-col justify-center">
              <p className="reveal text-xs font-semibold uppercase tracking-widest mb-4 opacity-60">Why YWEE</p>
              <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold leading-tight mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Stretch denim built for real girls
              </h2>
              <p className="reveal reveal-delay-2 text-sm leading-relaxed mb-8 opacity-70">
                Premium Cotton-Lycra denim that moves with your daughter — whether she's running, jumping, or just being her fabulous self. Made in India, priced for real families.
              </p>
              <div className="reveal reveal-delay-3 flex gap-5 sm:gap-8 mb-8 flex-wrap">
                <div>
                  <p className="text-4xl font-bold"><span ref={stat1}>0</span>+</p>
                  <p className="text-xs mt-1 opacity-60">Styles Available</p>
                </div>
                <div>
                  <p className="text-4xl font-bold"><span ref={stat2}>0</span></p>
                  <p className="text-xs mt-1 opacity-60">Age Sizes (1–14)</p>
                </div>
                <div>
                  <p className="text-4xl font-bold">100%</p>
                  <p className="text-xs mt-1 opacity-60">Made in India</p>
                </div>
              </div>
              <a href="#shop" className="reveal reveal-delay-4 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-all hover:opacity-80 self-start"
                style={{ borderColor: "var(--background)", color: "var(--background)" }}>
                Shop the Collection <ArrowRight size={14} />
              </a>
            </div>
            <div className="h-56 sm:h-72 md:h-auto overflow-hidden">
              <img src="/manus-storage/ywee-enhanced-floral-dark.png" alt="YWEE Denim" className="w-full h-full object-cover object-top" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS MARQUEE ── */}
      <section ref={testiReveal} className="py-12 sm:py-16 overflow-hidden">
        <div className="container mb-8">
          <p className="reveal text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--ywee-sage)" }}>What Parents Say</p>
          <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Loved by little ones,<br />trusted by parents
          </h2>
        </div>
        {/* Row 1 — left */}
        <div className="mb-4 overflow-hidden">
          <div className="animate-marquee flex gap-4" style={{ width: 'max-content', willChange: 'transform' }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="w-72 shrink-0 rounded-2xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={12} fill="var(--ywee-gold)" style={{ color: "var(--ywee-gold)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--foreground)" }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--ywee-sage)' }}>{t.avatar}</div>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 — right */}
        <div className="overflow-hidden">
          <div className="animate-marquee-rev flex gap-4" style={{ width: 'max-content', willChange: 'transform' }}>
            {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
              <div key={i} className="w-72 shrink-0 rounded-2xl border p-5"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={12} fill="var(--ywee-gold)" style={{ color: "var(--ywee-gold)" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'var(--ywee-sage)' }}>{t.avatar}</div>
                  <div>
                    <p className="text-xs font-semibold">{t.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Aggregate rating */}
        <div className="container mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="flex -space-x-2">
            {['/manus-storage/avatar1_13e4586f.jpg', '/manus-storage/avatar2_b62c24c9.jpg', '/manus-storage/avatar3.jpg'].map((src, i) => (
              <img key={i} src={src} alt="" width={32} height={32} className="w-8 h-8 rounded-full border-2 object-cover"
                loading="lazy" decoding="async"
                style={{ borderColor: "var(--background)" }} />
            ))}
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="var(--ywee-gold)" style={{ color: "var(--ywee-gold)" }} />)}
          </div>
          <span className="text-sm font-semibold">4.9/5</span>
          <span className="text-xs sm:text-sm text-center" style={{ color: "var(--muted-foreground)" }}>from 2,400+ verified reviews</span>
        </div>
      </section>

      {/* ── ABOUT US ── */}
      <section id="about-us" ref={aboutReveal} className="py-16 sm:py-24" style={{ background: "var(--secondary)" }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 md:items-center">
            {/* Left: story */}
            <div>
              <p className="reveal text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--ywee-sage)" }}>Our Story</p>
              <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Denim that grows<br />
                <span className="gradient-text">with your girl</span>
              </h2>
              <p className="reveal reveal-delay-2 text-sm leading-relaxed mb-4" style={{ color: "var(--muted-foreground)" }}>
                YWEE was born from a simple belief: every girl deserves jeans that fit perfectly, feel amazing, and look stunning — from her first steps to her first day of high school.
              </p>
              <p className="reveal reveal-delay-3 text-sm leading-relaxed mb-8" style={{ color: "var(--muted-foreground)" }}>
                Made by GENERATIONS CLOTHING LLP in India, our Cotton-Lycra stretch denim is designed for real girls who run, jump, dance, and dream big. Sizes from 1 to 14 years, priced so every family can afford quality.
              </p>
              {/* Values grid */}
              <div className="reveal reveal-delay-4 grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2v20M18 2v20M6 2c0 4 2 6 6 6s6-2 6-6M6 22c0-4 2-6 6-6s6 2 6 6" /></svg>, title: "Premium Stretch", desc: "Cotton-Lycra blend moves with your child, never restricts", color: "var(--ywee-terracotta)" },
                  { icon: <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="1" fill="currentColor" opacity="0.15" /><rect x="2" y="6" width="20" height="4" fill="#FF9933" /><rect x="2" y="10" width="20" height="4" fill="#fff" /><rect x="2" y="14" width="20" height="4" fill="#138808" /><circle cx="12" cy="12" r="2" fill="#000080" /></svg>, title: "Made in India", desc: "Proudly crafted by skilled Indian artisans", color: "var(--ywee-sage)" },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="3" /><path d="M12 2a7 7 0 0 1 0 14 3.5 3.5 0 0 0 0 7 7 7 0 0 1 0-14 3.5 3.5 0 0 0 0-7z" /></svg>, title: "Fun Prints", desc: "Floral, cartoon, solid — styles for every personality", color: "var(--ywee-brown)" },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="4" /></svg>, title: "Affordable Quality", desc: "Premium denim at prices families love", color: "var(--ywee-warm)" },
                ].map(v => (
                  <div key={v.title} className="p-4 rounded-2xl" style={{ background: "var(--card)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ color: v.color }}>{v.icon}</div>
                    <p className="text-sm font-semibold mb-1">{v.title}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{v.desc}</p>
                  </div>
                ))}
              </div>
              {/* Stats */}
              <div className="reveal flex gap-5 sm:gap-8 flex-wrap">
                {[{ n: "11+", l: "Unique Styles" }, { n: "Ages 1–14", l: "Size Range" }, { n: "100%", l: "Made in India" }].map(s => (
                  <div key={s.l}>
                    <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{s.n}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: image collage */}
            <div className="relative pb-16 sm:pb-20 md:pb-16">
              <div className="deco-blob absolute -top-4 -right-4 sm:-top-8 sm:-right-8 w-32 sm:w-48 h-32 sm:h-48 opacity-10" style={{ background: "var(--ywee-sage)" }} />
              <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img src="/manus-storage/ywee-enhanced-light-blue.png" alt="YWEE Light Blue Jeans" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                    <img src="/manus-storage/ywee-enhanced-black-love.png" alt="YWEE Black Jeans" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                    <img src="/manus-storage/ywee-enhanced-dark-solid.png" alt="YWEE Dark Blue Jeans" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 left-4 right-4 sm:left-8 sm:right-8 p-4 rounded-2xl shadow-xl z-20"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "var(--ywee-sage-light)" }}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><rect x="2" y="6" width="20" height="12" rx="1" fill="currentColor" opacity="0.15" /><rect x="2" y="6" width="20" height="4" fill="#FF9933" /><rect x="2" y="10" width="20" height="4" fill="#fff" /><rect x="2" y="14" width="20" height="4" fill="#138808" /><circle cx="12" cy="12" r="2" fill="#000080" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Proudly Made in India</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>GENERATIONS CLOTHING LLP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqReveal} className="py-12 sm:py-16">
        <div className="container max-w-3xl">
          <div className="mb-10">
            <p className="reveal text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--ywee-sage)" }}>FAQ</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Everything you need to know
            </h2>
          </div>
          <div className="reveal reveal-delay-2">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
          <div className="mt-8 p-6 rounded-2xl text-center" style={{ background: "var(--secondary)" }}>
            <p className="font-semibold mb-1">Still have questions?</p>
            <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
              Our team is here to help, 7 days a week
            </p>
            <a href="mailto:hello@ywee.in"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all hover:bg-secondary"
              style={{ borderColor: "var(--border)" }}>
              Contact Support →
            </a>
          </div>
        </div>
      </section>

      {/* ── FUN KIDS SECTION ── */}
      <section ref={funReveal} className="py-16 overflow-hidden relative" style={{ background: "var(--ywee-blush)" }}>
        {/* Animated SVG background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating stars */}
          {[
            { x: '5%', y: '15%', size: 20, delay: '0s', color: 'var(--ywee-gold)' },
            { x: '90%', y: '20%', size: 14, delay: '1s', color: 'var(--ywee-sage)' },
            { x: '15%', y: '70%', size: 18, delay: '2s', color: 'var(--ywee-terracotta)' },
            { x: '80%', y: '75%', size: 12, delay: '0.5s', color: 'var(--ywee-brown)' },
            { x: '50%', y: '10%', size: 16, delay: '1.5s', color: 'var(--ywee-sage)' },
          ].map((s, i) => (
            <div key={i} className="absolute float-leaf" style={{ left: s.x, top: s.y, animationDelay: s.delay }}>
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill={s.color}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
            </div>
          ))}
          {/* Floating circles */}
          {[
            { x: '25%', y: '30%', size: 60, color: 'var(--ywee-sage)', opacity: 0.08 },
            { x: '70%', y: '50%', size: 80, color: 'var(--ywee-terracotta)', opacity: 0.07 },
            { x: '45%', y: '80%', size: 50, color: 'var(--ywee-brown)', opacity: 0.06 },
          ].map((c, i) => (
            <div key={i} className="absolute rounded-full float-slow" style={{
              left: c.x, top: c.y, width: c.size, height: c.size,
              background: c.color, opacity: c.opacity,
              transform: 'translate(-50%, -50%)',
            }} />
          ))}
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--ywee-sage)" }}>Made for Play</p>
            <h2 className="reveal reveal-delay-1 text-3xl sm:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Every child deserves to
              <br /><span className="gradient-text">shine <svg className="inline-block w-8 h-8 sm:w-10 sm:h-10 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" /><path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" /></svg></span>
            </h2>
          </div>

          {/* Feature cards with hover animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M6 2v20M18 2v20M6 2c0 4 2 6 6 6s6-2 6-6M6 22c0-4 2-6 6-6s6 2 6 6" /></svg>, title: 'Stretch Denim', desc: 'Cotton-Lycra blend that moves with her', bg: '#c2185b', color: '#fce4ec' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><circle cx="12" cy="12" r="3" /><path d="M12 2a7 7 0 0 1 0 14 3.5 3.5 0 0 0 0 7 7 7 0 0 1 0-14 3.5 3.5 0 0 0 0-7z" /><path d="M12 22a7 7 0 0 1 0-14 3.5 3.5 0 0 0 0-7" /></svg>, title: 'Fun Prints', desc: 'Floral, cartoon & solid styles', bg: 'var(--ywee-sage-light)', color: 'var(--ywee-sage)' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" /></svg>, title: 'Ages 1–14', desc: 'Perfect fit for every stage of growing', bg: 'var(--ywee-sky)', color: 'var(--ywee-brown)' },
              { icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7"><rect x="2" y="6" width="20" height="12" rx="1" fill="currentColor" opacity="0.15" /><rect x="2" y="6" width="20" height="4" fill="#FF9933" /><rect x="2" y="10" width="20" height="4" fill="#fff" /><rect x="2" y="14" width="20" height="4" fill="#138808" /><circle cx="12" cy="12" r="2" fill="#000080" /></svg>, title: 'Made in India', desc: 'Quality craftsmanship, affordable price', bg: 'var(--ywee-sand)', color: 'var(--ywee-terracotta)' },
            ].map((f, i) => (
              <div key={f.title}
                className="reveal p-5 rounded-2xl text-center transition-all duration-300 cursor-default group hover:shadow-lg hover:-translate-y-1 relative"
                style={{ background: f.bg, animationDelay: `${i * 0.1}s` }}
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: f.color }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ color: f.color }}>{f.icon}</div>
                <p className="font-bold text-sm mb-1">{f.title}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Animated size guide visual */}
          <div className="reveal max-w-3xl mx-auto">
            <div className="rounded-3xl p-5 sm:p-8 relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="text-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--ywee-sage)" }}>Size Guide</p>
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Find the perfect fit</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { age: '0–6M', size: 'XS', height: '62–68cm', weight: '3–7kg', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg> },
                  { age: '6–12M', size: 'S', height: '68–80cm', weight: '7–10kg', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="8" r="4" /><path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M9 4c1-1 2-1.5 3-1.5s2 .5 3 1.5" /></svg> },
                  { age: '1–2Y', size: 'M', height: '80–92cm', weight: '10–13kg', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="6" r="3" /><path d="M12 9v4M8 20l2-7h4l2 7" /></svg> },
                  { age: '2–4Y', size: 'L', height: '92–104cm', weight: '13–16kg', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><circle cx="12" cy="5" r="3" /><path d="M12 8v3M7 21l3-10h4l3 10" /><path d="M9 11h6" /></svg> },
                ].map((s, i) => (
                  <div key={s.age} className="text-center p-3 rounded-xl transition-all hover:scale-105"
                    style={{ background: "var(--secondary)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2" style={{ color: "var(--ywee-sage)" }}>{s.icon}</div>
                    <p className="text-xs font-bold">{s.age}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.height}</p>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.weight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section ref={newsletterReveal} className="px-4 pb-8">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden"
          style={{ background: "var(--foreground)", color: "var(--background)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-5 sm:px-14 py-10 sm:py-12">
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-60">Join the Family</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Join the ywee world
              </h2>
              <p className="text-sm opacity-70">
                Get 10% off your first order and be the first to know about new arrivals and exclusive offers.
              </p>
            </div>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-80">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-full text-sm outline-none"
                  style={{ background: "oklch(1 0 0 / 0.12)", color: "var(--background)", border: "1px solid oklch(1 0 0 / 0.2)" }}
                />
                <button type="submit"
                  className="px-6 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ background: "var(--background)", color: "var(--foreground)" }}>
                  Subscribe →
                </button>
              </form>
            ) : (
              <div className="text-center px-8 py-4 rounded-2xl" style={{ background: "oklch(1 0 0 / 0.1)" }}>
                <p className="text-lg font-bold mb-1">You're in! <svg className="inline-block w-5 h-5 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" /></svg></p>
                <p className="text-sm opacity-70">Check your inbox for your 10% discount code.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }}>
        <div className="container py-12 sm:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2">
              <a href="/" className="inline-flex items-center gap-1 mb-4">
                <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>ywee</span>
                <span className="text-sm" style={{ color: "var(--ywee-sage)" }}>+</span>
              </a>
              <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: "var(--muted-foreground)" }}>
                Premium stretch denim jeans for girls aged 1–14. Made in India by GENERATIONS CLOTHING LLP.
              </p>
              <div className="flex gap-3">
                {["Instagram", "Facebook", "Pinterest", "TikTok"].map(s => (
                  <a key={s} href="#" className="w-9 h-9 rounded-full border flex items-center justify-center text-xs font-bold transition-all hover:bg-secondary"
                    style={{ borderColor: "var(--border)" }}>
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>
            {/* Shop */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">Shop</p>
              {["New In", "Dark Blue", "Light Blue", "Black", "Floral Prints", "Cartoon Prints"].map(l => (
                <a key={l} href="#" className="block text-sm py-1.5 transition-colors hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}>{l}</a>
              ))}
            </div>
            {/* Help */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">Customer Care</p>
              {["Shipping", "Returns", "Size Guide", "FAQs", "Contact Us"].map(l => (
                <a key={l} href="#" className="block text-sm py-1.5 transition-colors hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}>{l}</a>
              ))}
            </div>
            {/* About */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-4">About</p>
              {["Our Story", "Made in India", "Quality Promise", "Careers", "Press"].map(l => (
                <a key={l} href="#" className="block text-sm py-1.5 transition-colors hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}>{l}</a>
              ))}
              {/* Footer image */}
              <div className="mt-6 rounded-xl overflow-hidden">
                <img src="/manus-storage/ywee-enhanced-dark-solid.png" alt="YWEE Denim" className="w-full h-28 object-cover" />
                <div className="py-2">
                  <p className="text-xs font-semibold">Bold denim for bold girls</p>
                  <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>From toddler sass to tween class.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8 border-t"
            style={{ borderColor: "var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>© 2025 ywee by GENERATIONS CLOTHING LLP. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              {["Privacy Policy", "Terms & Conditions", "Cookie Settings"].map(l => (
                <a key={l} href="#" className="text-xs transition-colors hover:opacity-70"
                  style={{ color: "var(--muted-foreground)" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Mobile bottom padding ── */}
      <div className="lg:hidden h-20" />

      {/* ── Modals & Drawers ── */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthOpen={() => setAuthOpen(true)} />
      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}

      {/* ── Mobile Bottom Nav ── */}
      <MobileBottomNav
        onCartOpen={() => setCartOpen(true)}
        onSearchOpen={() => {}}
        onAuthOpen={() => setAuthOpen(true)}
      />

      {/* ── Back to top ── */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-11 h-11 rounded-full border flex items-center justify-center shadow-lg transition-all hover:scale-110 z-50"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
        aria-label="Back to top">
        ↑
      </button>
    </div>
  );
}

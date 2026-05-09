import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatINR } from "@/lib/products";
import { useLocation } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onAuthOpen: () => void;
}

export default function CartDrawer({ open, onClose, onAuthOpen }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end"
      style={{ background: "oklch(0 0 0 / 0.45)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cart-drawer-enter w-full max-w-md h-full flex flex-col shadow-2xl"
        style={{ background: "var(--card)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} strokeWidth={1.8} />
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Cart
            </h2>
            {totalItems > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                style={{ background: "var(--ywee-sage)" }}>
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clearCart}
                className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-secondary"
                style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                Clear all
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: "var(--secondary)" }}>
                <ShoppingBag size={32} strokeWidth={1.2} style={{ color: "var(--muted-foreground)" }} />
              </div>
              <div>
                <p className="font-semibold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Your cart is empty</p>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Add some beautiful pieces for your little ones
                </p>
              </div>
              <button onClick={onClose}
                className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--foreground)", color: "var(--background)" }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(item => (
                <div key={`${item.id}_${item.size}`}
                  className="flex gap-4 p-4 rounded-2xl border"
                  style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm leading-tight">{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          Size: {item.size} · {item.color}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)}
                        className="p-1 rounded-lg hover:bg-secondary transition-colors shrink-0"
                        style={{ color: "var(--muted-foreground)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-sm">{formatINR(item.price * item.quantity)}</span>
                      <div className="flex items-center gap-2 rounded-full border px-2 py-1"
                        style={{ borderColor: "var(--border)" }}>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t" style={{ borderColor: "var(--border)" }}>
            {/* Free shipping progress */}
            {totalPrice < 1500 && (
              <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "var(--secondary)" }}>
                <div className="flex justify-between mb-2">
                  <span>Add {formatINR(1500 - totalPrice)} more for free shipping</span>
                  <span className="font-semibold">{Math.round((totalPrice / 1500) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full progress-bar"
                    style={{ width: `${Math.min((totalPrice / 1500) * 100, 100)}%`, background: "var(--ywee-sage)" }} />
                </div>
              </div>
            )}
            {totalPrice >= 1500 && (
              <div className="mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2"
                style={{ background: "var(--ywee-sage-light)", color: "var(--ywee-sage)" }}>
                ✓ You've unlocked free shipping!
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Subtotal ({totalItems} items)</span>
              <span className="font-bold text-lg">{formatINR(totalPrice)}</span>
            </div>
            <button onClick={handleCheckout}
              className="w-full py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "var(--foreground)", color: "var(--background)" }}>
              Proceed to Checkout
              <ArrowRight size={16} />
            </button>
            <p className="text-center text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
              Secure checkout · Free returns · COD available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

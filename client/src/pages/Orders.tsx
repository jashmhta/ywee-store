import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatINR } from "@/lib/products";
import { useLocation } from "wouter";
import { ArrowLeft, Package, ChevronRight, Loader2, ShoppingBag } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "var(--ywee-warm)",
  confirmed: "var(--ywee-sage)",
  processing: "var(--ywee-sky)",
  shipped: "var(--ywee-terracotta)",
  delivered: "var(--ywee-sage)",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed ✓",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered ✓",
  cancelled: "Cancelled",
};

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: orderDetail } = trpc.orders.get.useQuery(
    { id: selectedOrderId! },
    { enabled: !!selectedOrderId && isAuthenticated }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--ywee-sage)" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign in to view orders
          </h2>
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold mt-4"
            style={{ background: "var(--foreground)", color: "var(--background)" }}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b px-4 py-4"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => selectedOrderId ? setSelectedOrderId(null) : navigate("/")}
            className="p-2 rounded-full hover:opacity-70 transition-opacity">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {selectedOrderId ? "Order Details" : "My Orders"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Order detail view */}
        {selectedOrderId && orderDetail ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: "var(--muted-foreground)" }}>Order Number</p>
                  <p className="font-bold text-lg">{orderDetail.orderNumber}</p>
                </div>
                <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: STATUS_COLORS[orderDetail.status] || "var(--ywee-sage)" }}>
                  {STATUS_LABELS[orderDetail.status] || orderDetail.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Placed on {new Date(orderDetail.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            </div>

            {/* Items */}
            <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h3 className="font-bold mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {orderDetail.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName}
                        className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {[item.size, item.color].filter(Boolean).join(" · ")} · Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-bold mt-1">{formatINR(Number(item.totalPrice))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping address */}
            <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h3 className="font-bold mb-3">Delivery Address</h3>
              <p className="text-sm font-semibold">{orderDetail.shippingFullName}</p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {orderDetail.shippingAddressLine1}
                {orderDetail.shippingAddressLine2 ? `, ${orderDetail.shippingAddressLine2}` : ""}
              </p>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {orderDetail.shippingCity}, {orderDetail.shippingState} – {orderDetail.shippingPincode}
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>{orderDetail.shippingPhone}
              </p>
            </div>

            {/* Price summary */}
            <div className="p-5 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <h3 className="font-bold mb-4">Price Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Subtotal</span>
                  <span>{formatINR(Number(orderDetail.subtotal))}</span>
                </div>
                {Number(orderDetail.discount) > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: "var(--ywee-sage)" }}>
                    <span>Discount</span>
                    <span>−{formatINR(Number(orderDetail.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Shipping</span>
                  <span>{Number(orderDetail.shippingFee) === 0 ? "FREE" : formatINR(Number(orderDetail.shippingFee))}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2"
                  style={{ borderColor: "var(--border)" }}>
                  <span>Total</span>
                  <span>{formatINR(Number(orderDetail.total))}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: orderDetail.paymentStatus === "paid" ? "var(--ywee-sage-light)" : "var(--secondary)",
                    color: orderDetail.paymentStatus === "paid" ? "var(--ywee-sage)" : "var(--muted-foreground)",
                  }}>
                  {orderDetail.paymentStatus === "paid" ? "✓ Paid" : "COD"}
                </span>
                <span className="text-xs capitalize" style={{ color: "var(--muted-foreground)" }}>
                  via {orderDetail.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Orders list */
          isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--ywee-sage)" }} />
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--secondary)" }}>
                <ShoppingBag size={32} style={{ color: "var(--muted-foreground)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                No orders yet
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
                Start shopping to see your orders here!
              </p>
              <button onClick={() => navigate("/")}
                className="px-8 py-3.5 rounded-full text-sm font-bold"
                style={{ background: "var(--foreground)", color: "var(--background)" }}>
                Shop Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "var(--secondary)" }}>
                        <Package size={18} style={{ color: "var(--ywee-sage)" }} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{order.orderNumber}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                        <p className="text-sm font-bold mt-1">{formatINR(Number(order.total))}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                        style={{ background: STATUS_COLORS[order.status] || "var(--ywee-sage)" }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                      <ChevronRight size={16} style={{ color: "var(--muted-foreground)" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

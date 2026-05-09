import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { formatINR } from "@/lib/products";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  MapPin, CreditCard, Truck, CheckCircle2, ChevronRight,
  Plus, Edit2, Trash2, ArrowLeft, ShoppingBag, Tag, Loader2,
  Smartphone, Building2, Wallet, Package
} from "lucide-react";

// ── Step indicator ────────────────────────────────────────────────────────────
const STEPS = ["Cart", "Address", "Payment", "Confirmation"];

function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex flex-col items-center`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? "text-white" : i === step ? "text-white" : "text-muted-foreground"
            }`} style={{
              background: i < step ? "var(--ywee-sage)" : i === step ? "var(--foreground)" : "var(--secondary)",
            }}>
              {i < step ? <CheckCircle2 size={16} /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium hidden sm:block ${
              i === step ? "" : "opacity-50"
            }`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-4 sm:mb-0 transition-all ${
              i < step ? "" : "opacity-20"
            }`} style={{ background: i < step ? "var(--ywee-sage)" : "var(--border)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Address Form ──────────────────────────────────────────────────────────────
interface AddressFormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const EMPTY_ADDRESS: AddressFormData = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "", isDefault: false,
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

function AddressForm({
  initial = EMPTY_ADDRESS,
  onSave,
  onCancel,
  loading,
}: {
  initial?: AddressFormData;
  onSave: (data: AddressFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [form, setForm] = useState<AddressFormData>(initial);
  const set = (k: keyof AddressFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.addressLine1 || !form.city || !form.state || !form.pincode) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      toast.error("Pincode must be 6 digits");
      return;
    }
    onSave(form);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 border";
  const inputStyle = { background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Full Name *
          </label>
          <input className={inputClass} style={inputStyle} placeholder="e.g. Priya Sharma"
            value={form.fullName} onChange={set("fullName")} required />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            Phone Number *
          </label>
          <input className={inputClass} style={inputStyle} placeholder="10-digit mobile number"
            value={form.phone} onChange={set("phone")} type="tel" required />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Address Line 1 *
        </label>
        <input className={inputClass} style={inputStyle} placeholder="House/Flat No., Building, Street"
          value={form.addressLine1} onChange={set("addressLine1")} required />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>
          Address Line 2 (optional)
        </label>
        <input className={inputClass} style={inputStyle} placeholder="Landmark, Area"
          value={form.addressLine2} onChange={set("addressLine2")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>City *</label>
          <input className={inputClass} style={inputStyle} placeholder="City"
            value={form.city} onChange={set("city")} required />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>State *</label>
          <select className={inputClass} style={inputStyle} value={form.state} onChange={set("state")} required>
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>Pincode *</label>
          <input className={inputClass} style={inputStyle} placeholder="6-digit pincode"
            value={form.pincode} onChange={set("pincode")} maxLength={6} required />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.isDefault}
          onChange={e => setForm(prev => ({ ...prev, isDefault: e.target.checked }))}
          className="w-4 h-4 rounded" />
        <span className="text-sm">Set as default address</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)" }}>
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "var(--foreground)", color: "var(--background)" }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          Save Address
        </button>
      </div>
    </form>
  );
}

// ── Payment Method Selector ───────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", desc: "Pay via GPay, PhonePe, Paytm", icon: Smartphone, color: "var(--ywee-sage)" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard, color: "var(--ywee-terracotta)" },
  { id: "netbanking", label: "Net Banking", desc: "All major banks supported", icon: Building2, color: "var(--ywee-brown)" },
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Wallet, color: "var(--ywee-warm)" },
];

// ── Main Checkout Page ────────────────────────────────────────────────────────
export default function Checkout() {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=confirmation
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderId: number; orderNumber: string; total: number } | null>(null);

  const { data: addressList, refetch: refetchAddresses } = trpc.addresses.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createAddressMutation = trpc.addresses.create.useMutation({
    onSuccess: () => { void refetchAddresses(); setShowAddressForm(false); toast.success("Address saved!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteAddressMutation = trpc.addresses.delete.useMutation({
    onSuccess: () => { refetchAddresses(); toast.success("Address removed"); },
    onError: (e) => toast.error(e.message),
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      setConfirmedOrder({ orderId: data.orderId, orderNumber: data.orderNumber, total: data.total });
      clearCart();
      setStep(3);
      setProcessingPayment(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setProcessingPayment(false);
    },
  });

  // Auto-select default address
  useEffect(() => {
    if (addressList && addressList.length > 0 && !selectedAddressId) {
      const def = addressList.find(a => a.isDefault) || addressList[0];
      setSelectedAddressId(def.id);
    }
  }, [addressList]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!authLoading && totalItems === 0 && step < 3) {
      navigate("/");
    }
  }, [totalItems, authLoading]);

  const shippingFee = totalPrice >= 999 ? 0 : 99;
  const discount = appliedCoupon === "WELCOME10" ? Math.round(totalPrice * 0.1) : 0;
  const grandTotal = totalPrice - discount + shippingFee;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "WELCOME10") {
      setAppliedCoupon("WELCOME10");
      setCouponDiscount(Math.round(totalPrice * 0.1));
      toast.success("Coupon applied! 10% off");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { toast.error("Please select a delivery address"); return; }
    const addr = addressList?.find(a => a.id === selectedAddressId);
    if (!addr) { toast.error("Address not found"); return; }

    setProcessingPayment(true);

    // Simulate payment gateway delay
    if (paymentMethod !== "cod") {
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    createOrderMutation.mutate({
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      shippingAddress: {
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 ?? undefined,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
      },
      paymentMethod: paymentMethod as any,
      couponCode: appliedCoupon ?? undefined,
    });
  };

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
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "var(--secondary)" }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign in to continue
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
            Please sign in to complete your purchase
          </p>
          <button onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:opacity-90"
            style={{ background: "var(--foreground)", color: "var(--background)" }}>
            Sign In to Checkout
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Confirmation ──────────────────────────────────────────────────
  if (step === 3 && confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* Success animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-bounce-once"
              style={{ background: "var(--ywee-sage-light)" }}>
              <CheckCircle2 size={48} style={{ color: "var(--ywee-sage)" }} />
            </div>
            {/* Confetti-like dots */}
            {[
              { color: "var(--ywee-terracotta)", size: 6 },
              { color: "var(--ywee-sage)", size: 8 },
              { color: "var(--ywee-gold)", size: 5 },
              { color: "var(--ywee-terracotta)", size: 7 },
              { color: "var(--ywee-sage)", size: 6 },
            ].map((d, i) => (
              <div key={i} className="absolute float-leaf"
                style={{
                  top: `${[10, 0, 5, 15, 8][i]}%`,
                  left: `${[10, 30, 50, 70, 85][i]}%`,
                  animationDelay: `${i * 0.3}s`,
                }}>
                <svg width={d.size * 2} height={d.size * 2} viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill={d.color} opacity="0.6" /></svg>
              </div>
            ))}
          </div>

          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Order Placed!
          </h1>
          <p className="text-sm mb-2" style={{ color: "var(--muted-foreground)" }}>
            Thank you for shopping with ywee!
          </p>
          <div className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-6"
            style={{ background: "var(--secondary)" }}>
            Order #{confirmedOrder.orderNumber}
          </div>

          <div className="rounded-2xl p-6 mb-6 text-left space-y-3"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Order Number</span>
              <span className="font-bold">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Total Paid</span>
              <span className="font-bold">{formatINR(confirmedOrder.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Estimated Delivery</span>
              <span className="font-bold">3–5 business days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--muted-foreground)" }}>Status</span>
              <span className="font-bold px-2 py-0.5 rounded-full text-xs text-white"
                style={{ background: "var(--ywee-sage)" }}>Confirmed</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/orders")}
              className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2"
              style={{ background: "var(--foreground)", color: "var(--background)" }}>
              <Package size={16} /> View My Orders
            </button>
            <button onClick={() => navigate("/")}
              className="w-full py-3.5 rounded-full text-sm font-semibold border"
              style={{ borderColor: "var(--border)" }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedAddress = addressList?.find(a => a.id === selectedAddressId);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b px-4 py-4"
        style={{ background: "var(--nav-bg)", backdropFilter: "blur(20px)", borderColor: "var(--border)" }}>
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => step === 1 ? navigate("/") : setStep(s => s - 1)}
            className="p-2 rounded-full hover:opacity-70 transition-opacity">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <StepBar step={step} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── STEP 1: Address ── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Delivery Address
                </h2>

                {/* Saved addresses */}
                {addressList && addressList.length > 0 && !showAddressForm && (
                  <div className="space-y-3 mb-4">
                    {addressList.map(addr => (
                      <div key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedAddressId === addr.id ? "ring-2" : "hover:border-foreground/30"
                        }`}
                        style={{
                          background: "var(--card)",
                          borderColor: selectedAddressId === addr.id ? "var(--foreground)" : "var(--border)",
                        }}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedAddressId === addr.id ? "border-foreground" : "border-muted-foreground"
                            }`} style={{ borderColor: selectedAddressId === addr.id ? "var(--foreground)" : "var(--border)" }}>
                              {selectedAddressId === addr.id && (
                                <div className="w-2 h-2 rounded-full" style={{ background: "var(--foreground)" }} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-sm">{addr.fullName}</p>
                                {addr.isDefault === 1 && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: "var(--ywee-sage-light)", color: "var(--ywee-sage)" }}>
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                              </p>
                              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                {addr.city}, {addr.state} – {addr.pincode}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>{addr.phone}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); deleteAddressMutation.mutate({ id: addr.id }); }}
                            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity shrink-0"
                            style={{ color: "var(--muted-foreground)" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address */}
                {!showAddressForm ? (
                  <button onClick={() => setShowAddressForm(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-70"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
                    <Plus size={16} /> Add New Address
                  </button>
                ) : (
                  <div className="p-5 rounded-2xl border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                    <h3 className="font-bold mb-4">New Address</h3>
                    <AddressForm
                      onSave={data => createAddressMutation.mutate(data)}
                      onCancel={() => setShowAddressForm(false)}
                      loading={createAddressMutation.isPending}
                    />
                  </div>
                )}

                {/* Continue button */}
                {!showAddressForm && (
                  <button
                    onClick={() => {
                      if (!selectedAddressId) { toast.error("Please select or add a delivery address"); return; }
                      setStep(2);
                    }}
                    className="w-full mt-6 py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: "var(--foreground)", color: "var(--background)" }}>
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Payment Method
                </h2>

                {/* Selected address summary */}
                {selectedAddress && (
                  <div className="p-4 rounded-2xl mb-6 flex items-start gap-3"
                    style={{ background: "var(--secondary)" }}>
                    <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--ywee-sage)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{selectedAddress.fullName}</p>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {selectedAddress.addressLine1}, {selectedAddress.city}, {selectedAddress.state} – {selectedAddress.pincode}
                      </p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-xs font-semibold shrink-0"
                      style={{ color: "var(--ywee-sage)" }}>Change</button>
                  </div>
                )}

                {/* Payment options */}
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map(pm => {
                    const Icon = pm.icon;
                    return (
                      <div key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          paymentMethod === pm.id ? "ring-2" : "hover:border-foreground/30"
                        }`}
                        style={{
                          background: "var(--card)",
                          borderColor: paymentMethod === pm.id ? "var(--foreground)" : "var(--border)",
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: "var(--secondary)" }}>
                            <Icon size={18} style={{ color: pm.color }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{pm.label}</p>
                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{pm.desc}</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === pm.id ? "" : ""
                          }`} style={{ borderColor: paymentMethod === pm.id ? "var(--foreground)" : "var(--border)" }}>
                            {paymentMethod === pm.id && (
                              <div className="w-2 h-2 rounded-full" style={{ background: "var(--foreground)" }} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* UPI simulation */}
                {paymentMethod === "upi" && (
                  <div className="p-4 rounded-2xl mb-4" style={{ background: "var(--secondary)" }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>Enter UPI ID</p>
                    <input
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                      style={{ background: "var(--background)", borderColor: "var(--border)" }}
                      placeholder="yourname@upi (simulation)"
                      defaultValue="demo@upi"
                    />
                    <p className="text-[10px] mt-2" style={{ color: "var(--muted-foreground)" }}>
                      <svg className="w-3 h-3 inline mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> This is a payment simulation — no real transaction will occur
                    </p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="p-4 rounded-2xl mb-4 space-y-3" style={{ background: "var(--secondary)" }}>
                    <div>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>Card Number</p>
                      <input className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                        style={{ background: "var(--background)", borderColor: "var(--border)" }}
                        placeholder="4242 4242 4242 4242 (test)" defaultValue="4242 4242 4242 4242" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>Expiry</p>
                        <input className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                          style={{ background: "var(--background)", borderColor: "var(--border)" }}
                          placeholder="MM/YY" defaultValue="12/26" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>CVV</p>
                        <input className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                          style={{ background: "var(--background)", borderColor: "var(--border)" }}
                          placeholder="123" defaultValue="123" type="password" />
                      </div>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      <svg className="w-3 h-3 inline mr-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> This is a payment simulation — no real transaction will occur
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={processingPayment}
                  className="w-full py-4 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-70"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}>
                  {processingPayment ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {paymentMethod === "cod" ? "Placing Order..." : "Processing Payment..."}
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod" ? <Wallet size={16} /> : <CreditCard size={16} />}
                      {paymentMethod === "cod" ? "Place Order" : `Pay ${formatINR(grandTotal)}`}
                    </>
                  )}
                </button>

                {processingPayment && paymentMethod !== "cod" && (
                  <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: "var(--secondary)" }}>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Loader2 size={20} className="animate-spin" style={{ color: "var(--ywee-sage)" }} />
                      <p className="text-sm font-semibold">Connecting to payment gateway...</p>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full animate-pulse" style={{ background: "var(--ywee-sage)", width: "60%" }} />
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
                      Simulating secure payment... please wait
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border p-5 sticky top-24"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ShoppingBag size={16} /> Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img src={item.image} alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-2">{item.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {item.size} · {item.color} · Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-bold mt-1">{formatINR(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {!appliedCoupon ? (
                <div className="flex gap-2 mb-4">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none border"
                    style={{ background: "var(--background)", borderColor: "var(--border)" }}
                  />
                  <button onClick={handleApplyCoupon}
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                    style={{ background: "var(--secondary)" }}>
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl"
                  style={{ background: "var(--ywee-sage-light)" }}>
                  <div className="flex items-center gap-2">
                    <Tag size={12} style={{ color: "var(--ywee-sage)" }} />
                    <span className="text-xs font-bold" style={{ color: "var(--ywee-sage)" }}>{appliedCoupon}</span>
                  </div>
                  <button onClick={() => { setAppliedCoupon(null); setCouponDiscount(0); setCouponCode(""); }}
                    className="text-xs" style={{ color: "var(--muted-foreground)" }}>Remove</button>
                </div>
              )}

              {/* Price breakdown */}
              <div className="space-y-2 border-t pt-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Subtotal ({totalItems} items)</span>
                  <span>{formatINR(totalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: "var(--ywee-sage)" }}>
                    <span>Discount (WELCOME10)</span>
                    <span>−{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--muted-foreground)" }}>Shipping</span>
                  <span>{shippingFee === 0 ? <span style={{ color: "var(--ywee-sage)" }}>FREE</span> : formatINR(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    Free shipping on orders above ₹999
                  </p>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-3"
                  style={{ borderColor: "var(--border)" }}>
                  <span>Total</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
                {[
                  { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>, text: "Secure & encrypted checkout" },
                  { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>, text: "Free returns within 14 days" },
                  { icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, text: "100% authentic products" },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0">{b.icon}</span>
                    <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

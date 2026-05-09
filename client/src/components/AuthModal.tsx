import { useEffect, useRef, useState } from "react";
import { X, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getDismissedReason: () => string; getSkippedReason: () => string }) => void) => void;
        };
      };
    };
  }
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { googleLogin, isLoading } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [scriptLoading, setScriptLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    if (!open) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID not set — using demo mode");
      setScriptLoading(false);
      setScriptError(true);
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      setScriptLoading(false);
      setScriptError(false);

      if (initialized.current) {
        // Re-render button if modal reopened
        if (btnRef.current) {
          btnRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: "outline",
            size: "large",
            width: 300,
            text: "continue_with",
            shape: "pill",
          });
        }
        return;
      }
      initialized.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          const result = await googleLogin(response.credential);
          if (result.success) {
            toast.success("Welcome to ywee!");
            onClose();
          } else {
            toast.error(result.error || "Sign in failed");
          }
        },
        auto_select: true,
        cancel_on_tap_outside: true,
      });

      if (btnRef.current) {
        btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 300,
          text: "continue_with",
          shape: "pill",
        });
      }
    };

    // Load GIS script if not already loaded
    if (!document.getElementById("google-identity-script")) {
      setScriptLoading(true);
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      script.onerror = () => {
        setScriptLoading(false);
        setScriptError(true);
      };
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [open, googleLogin, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card)" }}>

        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--ywee-sage), var(--ywee-gold), var(--ywee-terracotta))" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome to <span style={{ color: "var(--ywee-sage)" }}>ywee</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              Sign in to track orders, save favorites & more
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Benefits */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>, label: "Track Orders" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>, label: "Save Favorites" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>, label: "Secure Checkout" },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
                style={{ background: "var(--secondary)" }}>
                <div style={{ color: "var(--ywee-sage)" }}>{b.icon}</div>
                <span className="text-[10px] font-semibold text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Google Sign-In Button */}
          <div className="flex flex-col items-center gap-3">
            {scriptLoading && (
              <div className="flex items-center gap-2 px-6 py-3 rounded-full border"
                style={{ borderColor: "var(--border)" }}>
                <Loader2 size={18} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />
                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>Loading sign in...</span>
              </div>
            )}

            {scriptError && (
              <div className="text-center">
                <p className="text-sm mb-2" style={{ color: "var(--destructive)" }}>
                  Google Sign-In unavailable
                </p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  Please check your connection or try again later
                </p>
              </div>
            )}

            <div ref={btnRef} className={`flex justify-center min-h-[44px] ${scriptLoading ? 'hidden' : ''}`} />

            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                style={{ background: "var(--secondary)" }}>
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm font-medium">Signing you in...</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Shield size={12} style={{ color: "var(--ywee-sage)" }} />
            <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Secured by Google — we never see your password
            </span>
          </div>
          <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:opacity-70">Terms</a> and{" "}
            <a href="#" className="underline hover:opacity-70">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { X, Loader2, ArrowRight } from "lucide-react";
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

// Google "G" logo SVG
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { googleLogin, isLoading } = useAuth();
  const initialized = useRef(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!open) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      setScriptLoaded(true);
      setScriptError(false);

      if (!initialized.current) {
        initialized.current = true;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: { credential: string }) => {
            setSigningIn(true);
            const result = await googleLogin(response.credential);
            setSigningIn(false);
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
      }
    };

    if (!clientId) {
      setScriptLoaded(true);
      setScriptError(false);
      return;
    }

    if (!document.getElementById("google-identity-script")) {
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogle();
      script.onerror = () => {
        setScriptLoaded(true);
        setScriptError(true);
      };
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [open, googleLogin, onClose]);

  const handleGoogleClick = () => {
    if (!window.google?.accounts?.id) {
      toast.error("Google Sign-In is loading. Please try again.");
      return;
    }
    window.google.accounts.id.prompt();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div className="modal-enter w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card)" }}>

        {/* Top gradient bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)" }} />

        <div className="flex flex-col sm:flex-row">
          {/* Left: Branding (desktop) / Top (mobile) */}
          <div className="sm:w-5/12 p-6 sm:p-8 flex flex-col justify-center sm:border-r"
            style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
            <div className="flex items-center gap-1 mb-4">
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>ywee</span>
              <span className="text-sm" style={{ color: "var(--ywee-sage)" }}>+</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome back
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
              Sign in to track orders, save favorites & get exclusive offers
            </p>

            {/* Benefits */}
            <div className="flex flex-col gap-3">
              {[
                { icon: "📦", text: "Track your orders" },
                { icon: "❤️", text: "Save favorite items" },
                { icon: "🎁", text: "Exclusive member offers" },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-3">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Sign In */}
          <div className="sm:w-7/12 p-6 sm:p-8 flex flex-col justify-center relative">
            <button onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
              aria-label="Close">
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Sign in to your account
              </h3>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                One-click sign in with your Google account
              </p>
            </div>

            {/* Google Sign-In Button — branded per Google guidelines */}
            <button
              onClick={handleGoogleClick}
              disabled={signingIn || isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "#fff",
                color: "#3c4043",
                border: "1px solid #dadce0",
              }}>
              {signingIn || isLoading ? (
                <Loader2 size={20} className="animate-spin" style={{ color: "#4285f4" }} />
              ) : (
                <GoogleLogo />
              )}
              <span>{signingIn ? "Signing you in..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>Secured by Google</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "var(--secondary)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--ywee-sage)" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                We use Google Sign-In for security. We never see or store your Google password.
              </p>
            </div>

            {/* Error state */}
            {scriptError && (
              <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "oklch(0.95 0.1 25)" }}>
                <p className="text-xs" style={{ color: "var(--destructive)" }}>
                  Google Sign-In couldn't load. Please check your connection.
                </p>
              </div>
            )}

            {/* Terms */}
            <p className="text-center text-[11px] mt-5" style={{ color: "var(--muted-foreground)" }}>
              By continuing, you agree to our{" "}
              <a href="#" className="underline hover:opacity-70">Terms</a> and{" "}
              <a href="#" className="underline hover:opacity-70">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

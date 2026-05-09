import { useEffect, useRef } from "react";
import { X } from "lucide-react";
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
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean }) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { googleLogin } = useAuth();
  const btnRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!open) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID not set");
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id || initialized.current) return;
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
      });

      if (btnRef.current) {
        btnRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 320,
          text: "continue_with",
          shape: "pill",
        });
      }
    };

    // Load GIS script if not already loaded
    if (!document.getElementById("google-identity-script")) {
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    } else {
      initGoogle();
    }
  }, [open, googleLogin, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.5)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-enter w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--card)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome to ywee
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Sign in to continue shopping
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Google Sign-In */}
        <div className="px-6 pb-6 flex flex-col items-center gap-4">
          <div ref={btnRef} className="flex justify-center min-h-[44px]" />
          <p className="text-center text-xs" style={{ color: "var(--muted-foreground)" }}>
            By signing in, you agree to our{" "}
            <a href="#" className="underline">Terms</a> and{" "}
            <a href="#" className="underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

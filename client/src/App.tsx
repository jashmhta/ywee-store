import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useCallback, useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import Home from "./pages/Home";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  // Lock body scroll while loader is visible
  useEffect(() => {
    if (loading) {
      document.body.classList.add("ywee-loading");
    } else {
      document.body.classList.remove("ywee-loading");
    }
    return () => {
      document.body.classList.remove("ywee-loading");
    };
  }, [loading]);

  const handleLoaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <TooltipProvider>
                <Toaster position="bottom-center" />
                {/* Branded page loader — shown until critical assets are ready */}
                {loading && (
                  <PageLoader onComplete={handleLoaderComplete} />
                )}
                {/* Main app — rendered in background so assets start loading immediately */}
                <div
                  style={{
                    opacity: loading ? 0 : 1,
                    transition: "opacity 0.4s ease 0.1s",
                    visibility: loading ? "hidden" : "visible",
                  }}
                >
                  <Router />
                </div>
              </TooltipProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

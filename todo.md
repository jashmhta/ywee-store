# ywee Store TODO

## UI/UX Fixes
- [x] Navbar hide-on-scroll (both top nav and mobile bottom nav)
- [x] Remove header text from mobile nav (keep only pill)
- [x] Remove hero overlay for clean video background
- [x] Age cards: full-screen on mobile with snap scroll (one card at a time)
- [x] Testimonials marquee CSS fixed (animate-marquee and animate-marquee-rev)
- [x] Products section: 2-column grid on mobile (no horizontal scroll)
- [x] FAQ: smooth dropdown animation
- [x] Promo section: fixed empty space on mobile
- [x] About Us section added
- [x] Kids-friendly fun section with SVG animations and floating elements
- [x] Innovative scroll effects and reveal animations

## Auth & Database
- [x] Database schema: addresses, orders, order_items tables
- [x] DB migrations pushed successfully
- [x] Address CRUD operations (create, list, update, delete)
- [x] Order creation and retrieval
- [x] Manus OAuth wired to database (via existing _core/oauth.ts)

## Checkout Flow
- [x] Cart → Checkout navigation (CartDrawer button)
- [x] Checkout page: Step 1 - Address selection/creation
- [x] Checkout page: Step 2 - Payment method selection (UPI, Card, NetBanking, COD)
- [x] Payment simulation with loading state
- [x] Order confirmation page with order number
- [x] Orders page: list and detail view
- [x] My Orders link in Navbar (desktop user menu + mobile menu)
- [x] My Orders in mobile bottom nav

## Tests
- [x] Vitest tests for order calculation logic
- [x] Vitest tests for address validation
- [x] Vitest tests for order CRUD operations

## Device Issues (May 8, 2026)
- [x] ProductDetail: Add AuthModal, CartDrawer, SearchOverlay, MobileBottomNav
- [x] Fix TypeScript error in storageProxy.ts
- [ ] Wishlist page: create /wishlist route with saved items
- [ ] Mobile: verify bottom nav shows correctly on small screens
- [ ] Desktop: verify hover effects on product cards work

## Future Enhancements (out of scope for current request)
- [x] Product detail page (/product/:id with image gallery, size/color selector, add to cart, related products)
- [ ] Wishlist functionality
- [ ] Admin panel for order management
- [ ] Real payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications for orders
- [ ] Search functionality

## Real Brand Integration (May 8, 2026)
- [x] Uploaded 96 real YWEE product images to webdev storage
- [x] Replaced placeholder products.ts with real YWEE catalog (11 product groups, 96 ASINs)
- [x] Updated CATEGORIES with real age groups and AI-enhanced model images
- [x] Updated TESTIMONIALS with real Indian customer names and locations
- [x] Updated FAQS with real YWEE brand questions and answers
- [x] Updated hero section: new AI-generated hero video with Indian girls in YWEE denim
- [x] Updated announcement bar: removed "Organic & GOTS Certified", added denim messaging
- [x] Updated navbar: replaced age categories with color categories (Dark Blue, Light Blue, Black)
- [x] Updated product filter tabs: All Styles, Dark Blue, Light Blue, Black, New In
- [x] Updated collection slides with real YWEE brand collection banners
- [x] Updated sustainability section: real YWEE brand stats (11+ styles, ages 1-14, Made in India)
- [x] Updated about section: real YWEE brand story (GENERATIONS CLOTHING LLP)
- [x] Updated hero badge: "MADE IN INDIA · STRETCH DENIM · PREMIUM ·"
- [x] Updated trust bar: Cotton-Lycra Stretch, Made in India, Premium Quality, Easy Returns
- [x] Fixed VideoCard: conditional render when video is empty (shows image fallback)
- [x] AI-enhanced product images: Indian girl models with studio lighting for key products

## Mobile Responsiveness & Polish (May 8, 2026)
- [ ] Mobile: hero section text sizing and button layout
- [ ] Mobile: product card sizing, image aspect ratio, text overflow
- [ ] Mobile: age category cards scroll/snap behavior
- [ ] Mobile: collection slider layout and text readability
- [ ] Mobile: sustainability/why-ywee section layout
- [ ] Mobile: testimonials marquee spacing
- [ ] Mobile: about section grid layout
- [ ] Mobile: FAQ section padding and typography
- [ ] Mobile: footer layout and column stacking
- [ ] Mobile: newsletter section padding
- [ ] Cards: consistent image height, price alignment, badge positioning
- [ ] Cards: color swatch overflow on small cards
- [ ] Cards: size selector button overflow
- [ ] Cards: hover state polish (desktop)
- [ ] Overall: section padding consistency
- [ ] Overall: typography scale on mobile

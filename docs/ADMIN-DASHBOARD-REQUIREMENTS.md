# ZORIX Admin Dashboard Requirements

This document is the implementation checklist and acceptance baseline for the ZORIX store admin.

## 1. Access, authentication and security
- Initial store owner email: `zorixfit@admin.com`.
- First admin is created through a secure, one-time setup flow; the owner chooses the password.
- Never hardcode or store plaintext passwords, setup tokens or session tokens.
- Passwords are securely hashed; sessions use secure, HttpOnly cookies with expiry and revocation.
- Admin routes and write APIs require an authenticated session.
- Record important admin changes in `admin_audit_logs`.
- Start with owner/admin access; keep role support for editor and fulfillment roles.

## 2. Dashboard overview
- Show real database-backed totals: orders, sales/revenue, active products, low-stock items and customers.
- Show recent orders and recent admin activity.
- Show useful empty states when the store has no products or orders.
- Do not display fabricated sample metrics as real business data.

## 3. Product management
- Create, edit, preview, publish, unpublish, archive and delete products.
- Manage title, slug, description, category/collection, product type, SKU, price and sale/compare-at price.
- Manage product variants for size and colour, variant-level price/SKU/stock and availability.
- Manage inventory tracking and quantity.
- Support multiple product images, alt text, ordering and a featured image.
- Include SEO title and description.
- Keep the product catalogue suitable for the five initial ladies categories: Night Suits, Underwear, Bra, Sport Bra and Sport Underwear.

## 4. Collections
- Create, edit, activate/deactivate and reorder collections.
- Set title, slug, description, collection image and SEO fields.
- Assign/remove products and control product order within a collection.
- Seed the five initial categories without locking the owner out of adding more later.

## 5. Media library
- Upload, preview, search/select, replace and delete images.
- Use Cloudinary for image storage and delivery; keep credentials server-side.
- Store provider-neutral media identifiers and metadata in D1.
- Allow media selection for products, collections, homepage sections and content pages.
- Validate file type and size; provide useful upload errors.

## 6. Storefront content / CMS
- Edit homepage hero image, heading, body copy, CTA label and CTA destination.
- Edit, hide/show and reorder homepage sections, banners and collection highlights.
- Manage navigation labels/links, footer content, newsletter copy and social links.
- Create/edit/publish content pages such as About, Contact, FAQ, Shipping & Returns, Privacy Policy and Terms.
- Make placeholder/editorial images and text replaceable from the dashboard.
- Preserve one shared reusable storefront header and footer across public pages.

## 7. Orders and fulfilment
- List, search, filter and inspect orders.
- Show customer name, phone, address, items, variants, quantities, totals and notes.
- Support Cash on Delivery as the initial payment method.
- Update order status: pending, confirmed, processing, shipped, delivered, cancelled and returned.
- Keep a timestamped status history with optional admin notes.
- Ensure order totals are calculated and validated server-side.

## 8. Analytics
- Report page views, product views, add-to-cart, checkout-start and completed-order events.
- Show date-range summaries, conversion funnel and revenue based on actual stored events/orders.
- Keep anonymous analytics identifiers privacy-conscious and avoid exposing personal customer details in aggregate reports.

## 9. Store settings
- Manage store name, contact details, currency (PKR), shipping charges and COD settings.
- Manage customer-facing policy/content links and basic SEO defaults.
- Provide account/session management and sign-out.

## 10. Navigation and UX
- Responsive admin sidebar/topbar with clear active states.
- Consistent visual language across all admin pages.
- Forms with validation, save/cancel states, confirmation before destructive actions and success/error feedback.
- Search, filters, pagination and empty/loading states where relevant.
- Admin interface is separate from the public storefront header; all public pages share the same storefront header/footer components.

## Delivery rule
Build in secure, testable milestones: authentication and protected admin shell first, then dashboard overview, catalogue/collections, media/CMS, orders, analytics and settings. A section is only marked complete when its data flow works end-to-end against the real API/database; static mockups do not count as completed functionality.

# ZORIX Commerce Platform

## Product direction

Build an original ZORIX storefront using the Vintina reference for page composition and shopping flow. Do not copy Vintina's protected source, branding, copy, or photography.

## Architecture

- Storefront and admin UI: Next.js App Router, React, TypeScript, Tailwind CSS.
- Application hosting and branch previews: Vercel, connected to GitHub.
- Commerce API: Cloudflare Workers (TypeScript; Hono is the proposed router).
- Relational data: Cloudflare D1.
- Product, collection, editorial and campaign media: Cloudflare R2.
- Analytics: Cloudflare Web Analytics plus first-party commerce events for product views, add-to-cart, checkout start, and completed orders.

The browser must never receive Cloudflare API tokens or privileged credentials. The Worker owns D1/R2 access and validates every admin mutation.

## Repository layout target

src/
  app/
    (store)/
      page.tsx
      collections/[slug]/page.tsx
      products/[slug]/page.tsx
      cart/page.tsx
      checkout/page.tsx
    (admin)/
      admin/
        layout.tsx
        page.tsx
        products/
        collections/
        orders/
        content/
        navigation/
        media/
        analytics/
        settings/
    api/                  # server-side proxy/webhooks only, as needed
  components/
    storefront/
    admin/
    shared/
  features/
    catalog/
    cart/
    checkout/
    content/
    analytics/
  lib/
    api/
    auth/
    config/
    validation/
workers/
  commerce-api/
    src/
      routes/
      middleware/
      services/
      repositories/
    migrations/
    wrangler.toml
    package.json
docs/
  architecture/
  operations/

## Admin-managed capabilities

1. Catalog: products, collections, categories, SKUs, variants, size/color options, prices, sale prices, stock state, product media and SEO.
2. Content studio: homepage section ordering and visibility; hero slides; headings, paragraphs, CTAs, images; editorial/about/FAQ/policy pages; announcement bar; footer and navigation.
3. Orders: COD checkout orders, customer/address details, line items, status history, cancellation and fulfilment notes.
4. Media library: R2 upload, alt text, folder/tag metadata, image replacement and usage references.
5. Analytics: visitors, sessions, page views, top landing pages, product views, add-to-cart, checkout starts, orders, revenue and conversion rate.
6. Store settings: brand details, currency (PKR), shipping rules, COD settings, contact/social links and SEO defaults.

## Initial D1 domain model

- admins, admin_sessions, admin_audit_logs
- products, product_variants, product_images
- collections, collection_products
- content_pages, homepage_sections, navigation_menus, navigation_items
- customers, addresses
- carts, cart_items
- orders, order_items, order_status_events
- media_assets
- analytics_events

Use stable IDs, timestamps, indexed slugs/SKUs/status fields, and foreign keys. Money is stored consistently as integer minor units (PKR paisa) or integer PKR; never floating point. Choose one representation before migrations are written.

## Security and operational requirements

- Admin routes and API mutations require authenticated, authorized admin sessions.
- Hash passwords with a modern password hashing algorithm; rotate/revoke sessions; add CSRF protection and rate limiting.
- Validate payloads server-side; use prepared SQL statements; restrict upload MIME types and sizes.
- Keep all secrets in environment bindings, never commit them.
- Record admin audit events for destructive and money/order-affecting actions.
- Back up D1 and document restore steps before production launch.
- Treat analytics as aggregate/consent-aware; avoid collecting unnecessary personal data.

## Delivery milestones

1. Foundation: repository cleanup, typed API client, shared design tokens, route groups, environment documentation and CI checks.
2. Storefront: Vintina-inspired responsive homepage, navigation, collection/product pages, search, cart and mobile UX.
3. Cloudflare backend: D1 migrations, Worker API, R2 media uploads, seed data and validation.
4. Admin CMS: authentication, dashboard, product/collection CRUD, media library and editable homepage sections.
5. Commerce: COD checkout, orders, order status management and customer notifications.
6. Analytics and hardening: event tracking, dashboards, SEO, accessibility, performance, security and operational runbooks.

## Environment variables

See the root .env.example. Never add real credentials to Git.
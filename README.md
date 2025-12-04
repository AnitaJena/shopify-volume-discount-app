# Shopify Volume Discount (Buy 2, get X% off)
 
## What this repo provides
- A public Shopify App (MERN) with:
  - **Discount Function** extension that applies a percentage discount on cart lines when the quantity of a configured product >= 2.
  - **Admin UI** (React) page to pick products and set `percentOff` (1–80).
  - **Theme App Extension (App Block)** that shows `Buy 2, get {percentOff}% off` on configured Product Pages.
- Uses a shop-level metafield to store config:
  - `namespace: volume_discount` `key: rules`
  - value: JSON string: `{ "products": ["gid://shopify/Product/<id>"], "minQty": 2, "percentOff": 10 }`
 
## Requirements
- Node 18+ and npm
- Shopify CLI
- A Shopify Partner account and Dev Store (Online Store 2.0 recommended such as Dawn)
 
## Quick start (dev)
1. Install dependencies
   ```bash
   npm install
   npm install -g @shopify/cli
 

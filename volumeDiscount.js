// server/src/routes/volumeDiscount.js
const express = require('express');
const router = express.Router();

// helper to call Admin GraphQL. You must use your app session token or private app credentials depending on deployment.
async function adminGraphqlFetch(shop, accessToken, query, variables) {
  const url = `https://${shop}/admin/api/2025-07/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({ query, variables })
  });
  return res.json();
}

// GET current rules (for Admin UI)
router.get('/api/volume-discount', async (req, res) => {
  const { shop, accessToken } = req.session || {};
  if (!shop || !accessToken) return res.status(401).json({ error: 'not authenticated' });

  const query = `query getShopMetafield($ownerId: ID!) { shop { id } }`;
  // Simpler: use REST metafields read
  const url = `https://${shop}/admin/api/2025-07/metafields.json?namespace=volume_discount&key=rules`;
  const r = await fetch(url, { headers: { 'X-Shopify-Access-Token': accessToken } });
  const data = await r.json();
  const mf = (data.metafields && data.metafields[0]) || null;
  if (!mf) return res.json({ rules: null });
  try {
    return res.json({ rules: JSON.parse(mf.value) });
  } catch (e) {
    return res.json({ rules: null });
  }
});

// POST save rules
router.post('/api/volume-discount', express.json(), async (req, res) => {
  const { shop, accessToken } = req.session || {};
  if (!shop || !accessToken) return res.status(401).json({ error: 'not authenticated' });

  const payload = req.body.rules; // expected JSON object
  if (!payload) return res.status(400).json({ error: 'rules missing' });

  const mfPayload = {
    metafield: {
      namespace: 'volume_discount',
      key: 'rules',
      type: 'single_line_text_field',
      value: JSON.stringify(payload)
    }
  };

  const url = `https://${shop}/admin/api/2025-07/metafields.json`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify(mfPayload)
  });
  const data = await r.json();
  return res.json({ result: data });
});

// App proxy endpoint for theme block
router.get('/apps/volume-discount/config', async (req, res) => {
  // This endpoint will be called from the storefront. It must be enabled as an app proxy in your app config and be publicly accessible.
  // For security, don't require session here; just return the public config.
  const shop = req.query.shop; // If app proxy includes shop param
  // For dev, you can read shop from query or env. In production, verify proxy signature.

  // Fetch metafield for shop (use stored access token in your DB keyed by shop)
  const accessToken = process.env.SHOP_ACCESS_TOKEN; // replace with per-shop retrieval
  const url = `https://${shop}/admin/api/2025-07/metafields.json?namespace=volume_discount&key=rules`;
  const r = await fetch(url, { headers: { 'X-Shopify-Access-Token': accessToken } });
  const data = await r.json();
  const mf = (data.metafields && data.metafields[0]) || null;
  if (!mf) return res.json({ products: [], percentOff: 0, minQty: 2 });
  let rules;
  try { rules = JSON.parse(mf.value); } catch(e) { rules = null; }
  return res.json({ products: (rules && rules.products) || [], percentOff: (rules && rules.percentOff) || 0, minQty: (rules && rules.minQty) || 2 });
});

module.exports = router;

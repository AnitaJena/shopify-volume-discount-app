type CartLine = {
  id: string;
  quantity: number;
  merchandise?: { product?: { id?: string } };
  // other fields present in function input
};

type Cart = { lines: CartLine[] };

// The function receives `settings` as a JSON string if you attach settings, otherwise
// you'll need to provide the config as part of the function input or fetch server-side during build.

export function generateDiscounts(cart: Cart, settingsJson: string | null) {
  if (!settingsJson) return [];

  let cfg: any;
  try {
    cfg = JSON.parse(settingsJson);
  } catch (e) {
    // invalid config -> no ops
    return [];
  }

  if (!cfg.products || !Array.isArray(cfg.products) || (cfg.products.length === 0)) return [];
  const productSet = new Set(cfg.products);
  const percentOff = Number(cfg.percentOff) || 0;
  const minQty = Number(cfg.minQty) || 2;
  if (percentOff <= 0) return [];

  // Build operations: one percentage operation per qualifying line
  const operations: any[] = [];

  for (const line of cart.lines) {
    const productGid = line.merchandise?.product?.id;
    if (!productGid) continue;
    if (!productSet.has(productGid)) continue;
    if (line.quantity >= minQty) {
      operations.push({
        // this output object depends on the official Operation schema
        type: 'discount_line', // placeholder: replace with actual op type required by Shopify
        target: { type: 'line', id: line.id },
        percentage: percentOff
      });
    }
  }

  return operations;
}


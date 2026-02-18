// js/pricing.js

/**
 * Clamp a number between min and max.
 */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Calculate cabinet price using rules:
 * - Standard size: 32W x 32H x 21D
 * - Only increases above standard add cost (decreases do NOT reduce cost)
 * - Stain grade adds +15%
 *
 * @param {number} basePrice - price at standard size
 * @param {{w:number,h:number,d:number}} size - selected size
 * @param {"Paint Grade"|"Stain Grade"} finish
 * @param {object} rules - pricingRules from products.json
 * @param {{w:number,h:number,d:number}} minSize
 * @param {{w:number,h:number,d:number}} maxSize
 * @returns {{price:number, breakdown:object, normalizedSize:object}}
 */
export function calculatePrice(basePrice, size, finish, rules, minSize, maxSize) {
  // Normalize/clamp size
  const normalizedSize = {
    w: clamp(Number(size.w), minSize.w, maxSize.w),
    h: clamp(Number(size.h), minSize.h, maxSize.h),
    d: clamp(Number(size.d), minSize.d, maxSize.d),
  };

  const std = rules.standardSize;

  // Only charge for increases above standard (never discount decreases)
  const deltaW = Math.max(0, normalizedSize.w - std.w);
  const deltaH = Math.max(0, normalizedSize.h - std.h);
  const deltaD = Math.max(0, normalizedSize.d - std.d);

  const sizeUpcharge =
    (deltaW * rules.sizeUpcharge.perInchW) +
    (deltaH * rules.sizeUpcharge.perInchH) +
    (deltaD * rules.sizeUpcharge.perInchD);

  let subtotal = basePrice + sizeUpcharge;

  const stainUpcharge =
    (finish === "Stain Grade") ? subtotal * rules.stainGradeUpchargeRate : 0;

  const total = subtotal + stainUpcharge;

  return {
    price: Math.round(total * 100) / 100,
    normalizedSize,
    breakdown: {
      basePrice,
      deltaW, deltaH, deltaD,
      sizeUpcharge: Math.round(sizeUpcharge * 100) / 100,
      stainUpcharge: Math.round(stainUpcharge * 100) / 100
    }
  };
}

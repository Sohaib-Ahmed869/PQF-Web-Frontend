// Lightweight client-side helpers to evaluate promotion applicability per product

// Check date validity and active flag
export const isPromotionCurrentlyValid = (promotion) => {
  if (!promotion) return false;
  const now = new Date();
  const start = promotion.startDate ? new Date(promotion.startDate) : now;
  const end = promotion.endDate ? new Date(promotion.endDate) : now;
  const isActive = promotion.isActive !== false; // default true
  return isActive && start <= now && end >= now;
};

// Determine if product is applicable for the given promotion
export const isProductApplicableForPromotion = (promotion, product) => {
  if (!promotion || !product) return false;
  const pid = String(product._id || product.id || '');
  const productGroup = product.ItemsGroupCode || product.ItemGroupCode || product.groupCode || product.GroupCode;

  // Exclusions first
  const excludedProducts = Array.isArray(promotion.excludedProducts) ? promotion.excludedProducts : [];
  const excludedCategories = Array.isArray(promotion.excludedCategories) ? promotion.excludedCategories : [];

  if (excludedProducts.some((p) => String(p?._id || p) === pid)) return false;
  if (productGroup !== undefined && excludedCategories.some((c) => {
    const code = c?.ItemsGroupCode;
    return code !== undefined && code === productGroup;
  })) return false;

  const applicableProducts = Array.isArray(promotion.applicableProducts) ? promotion.applicableProducts : [];
  const applicableCategories = Array.isArray(promotion.applicableCategories) ? promotion.applicableCategories : [];

  // If none specified, it applies to all products (except excluded)
  if (applicableProducts.length === 0 && applicableCategories.length === 0) return true;

  if (applicableProducts.some((p) => String(p?._id || p) === pid)) return true;

  if (productGroup !== undefined && applicableCategories.some((c) => {
    const code = c?.ItemsGroupCode;
    return code !== undefined && code === productGroup;
  })) return true;

  return false;
};

// Filter promotions that are valid now and applicable to the product
export const getApplicablePromotionsForProduct = (promotions, product) => {
  const list = Array.isArray(promotions) ? promotions : [];
  return list.filter((promo) => isPromotionCurrentlyValid(promo) && isProductApplicableForPromotion(promo, product));
};

// Compute free quantity for buyXGetY based on current paid quantity
export const computeBuyXGetYFreeQty = (promotion, paidQuantity) => {
  if (!promotion?.rule?.buyXGetY) return 0;
  const { buyQuantity, getQuantity } = promotion.rule.buyXGetY;
  if (!buyQuantity || !getQuantity || paidQuantity <= 0) return 0;
  const sets = Math.floor(paidQuantity / buyQuantity);
  return sets * getQuantity;
};

// Compute quantity-discount per-product share
// cartItems: [{ product, quantity, price, isFreeItem, freeQuantity }]
export const computeQuantityDiscountForProduct = (promotion, product, cartItems, getUnitPrice) => {
  if (!promotion?.rule?.quantityDiscount) return { eligible: false, productDiscount: 0, totalDiscount: 0 };
  const { minQuantity, discountPercentage, discountAmount } = promotion.rule.quantityDiscount;
  if (!minQuantity || minQuantity <= 0) return { eligible: false, productDiscount: 0, totalDiscount: 0 };

  const applicableItems = (Array.isArray(cartItems) ? cartItems : []).filter((ci) =>
    isProductApplicableForPromotion(promotion, ci.product)
  );

  const mapPaidQty = (ci) => {
    if (ci.isFreeItem) return 0;
    const freeQty = ci.freeQuantity || 0;
    return Math.max(0, (ci.quantity || 0) - freeQty);
  };

  const totalPaidQty = applicableItems.reduce((sum, ci) => sum + mapPaidQty(ci), 0);
  const productCartItem = applicableItems.find((ci) => String(ci.product?._id || ci.product?.id || ci.product) === String(product?._id || product?.id));
  const productPaidQty = productCartItem ? mapPaidQty(productCartItem) : 0;

  if (totalPaidQty < minQuantity) return { eligible: false, productDiscount: 0, totalDiscount: 0 };

  // Calculate totals for allocation
  const lineValue = (ci) => {
    const price = typeof ci.price === 'number' ? ci.price : getUnitPrice(ci.product);
    return price * mapPaidQty(ci);
  };
  const totalApplicableValue = applicableItems.reduce((sum, ci) => sum + lineValue(ci), 0);
  const productValue = productCartItem ? lineValue(productCartItem) : 0;

  let totalDiscount = 0;
  if (discountAmount && discountAmount > 0) {
    totalDiscount = discountAmount;
  } else if (discountPercentage && discountPercentage > 0) {
    totalDiscount = totalApplicableValue * (discountPercentage / 100);
  }

  // Allocate proportional discount to this product
  const productDiscount = totalApplicableValue > 0 ? (productValue / totalApplicableValue) * totalDiscount : 0;

  return {
    eligible: totalDiscount > 0,
    productDiscount,
    totalDiscount
  };
};



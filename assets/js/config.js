/* =====================================================================
   SATYANAND AYURVEDA — store settings
   Everything a shop owner is likely to change lives in this one file.
   ===================================================================== */
window.SATYANAND_CONFIG = {
  brand: 'Satyanand Ayurveda',

  /* ⚠️ SET BEFORE LAUNCH ------------------------------------------------
     Orders and consultations are sent to this WhatsApp number.
     Country code + number, digits only, no "+", no spaces.
     India example: 919812345678   (91 = country code)
     While it is blank, checkout still works but shows the order summary
     with a "copy" button instead of opening WhatsApp.                   */
  whatsapp: '',
  phone: '',          // shown in the footer, e.g. '+91 98123 45678'
  email: '',          // shown in the footer, e.g. 'care@satyanandayurveda.com'

  /* Shipping ------------------------------------------------------------ */
  freeShippingAt: 599,    // order value (after coupon) that ships free
  shippingFee: 60,        // charged below that
  codFee: 0,              // extra for Cash on Delivery, 0 to disable
  maxQtyPerItem: 10,

  /* Coupons ---------------------------------------------------------------
     type: 'percent' | 'flat'. minSubtotal is checked against the cart
     subtotal. There is no server, so these are applied in the browser and
     re-checked by you when the order arrives on WhatsApp.                */
  coupons: {
    SATYA10:     { type: 'percent', value: 10,  minSubtotal: 0,    maxDiscount: 300, note: '10% off your first order' },
    WELLNESS200: { type: 'flat',    value: 200, minSubtotal: 1499,                  note: '₹200 off orders above ₹1,499' }
  }
};

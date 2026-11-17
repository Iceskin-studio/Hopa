import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Basic i18n configuration with English (default) and Arabic (RTL) support.
 * Only the keys required by the current UI are defined.
 */
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          storeName: "Fashion Hub",
          cart: "Cart",
          emptyCart: "Your cart is empty.",
          price: "Price",
          total: "Total",
          checkout: "Checkout",
          language: "Language",
          // Additional generic keys
          addToCart: "Add to Cart",
          quantity: "Quantity",
          size: "Size",
          color: "Color",
        },
      },
      ar: {
        translation: {
          storeName: "متجر الأزياء",
          cart: "عربة التسوق",
          emptyCart: "عربة التسوق فارغة.",
          price: "السعر",
          total: "الإجمالي",
          checkout: "الدفع",
          language: "اللغة",
          addToCart: "أضف إلى السلة",
          quantity: "الكمية",
          size: "المقاس",
          color: "اللون",
        },
      },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

import type { Metadata } from "next";
import { V9CartProvider } from "../cart/V9CartContext";
import V9Checkout from "./V9Checkout";
import "../marketing-v9.css";

// Isolated checkout for the /marketing-v9 flow. Its own cart provider (reads the
// same v9 localStorage cart) — the site's cart and /checkout are untouched.
export const metadata: Metadata = {
  title: "Checkout | Train 321",
  robots: { index: false, follow: false }
};

export default function Page() {
  return (
    <V9CartProvider>
      <V9Checkout />
    </V9CartProvider>
  );
}

import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout — Train321",
  description: "Complete your enrollment.",
  // Nothing here should ever be indexed — it's a transactional page whose
  // content depends entirely on the visitor's own cart.
  robots: { index: false, follow: false }
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

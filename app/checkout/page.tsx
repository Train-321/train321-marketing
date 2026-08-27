import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout",
  description: "Complete your enrollment.",
  // Nothing here should ever be indexed — it's a transactional page whose
  // content depends entirely on the visitor's own cart.
  robots: { index: false, follow: false }
};

// The Stripe publishable key MUST belong to the same Stripe account as the
// LMS backend's secret key, or every payment dies with "No such token". Which
// backend we talk to is a server-side setting (NEW_FEATURES_API_BASE), so the
// pairing is resolved here on the server and handed to the client:
//
//   new-features-api.train321.com  → staging LMS  → test-mode key
//   api.train321.com               → production LMS → live-mode key
//
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY still overrides both when set.
// Publishable keys are public by design (they can only tokenise, never
// charge), so shipping them in code is safe.
const STAGING_PK =
  "pk_test_51TXerrHCrvN27dgKikzbOVKiEgVrnoGpmaDOaRQ19Rggz4Vwobdezb8CughlPawXWT662nPSCAsWQPOGWdJc3I3Z00Ylg5794l";
const PROD_PK =
  "pk_live_51KO1kjFsx1ZDP6JZq7zsgP0IqRvMu9a9l84IpshxlQ9LEF8IOWSKTfLWIRehvPXdsKT0bJJwsuyKO0XzeZowDehF00IPuNMZnr";

export default function CheckoutPage() {
  const apiBase =
    process.env.NEW_FEATURES_API_BASE || "https://api.train321.com";

  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    (apiBase.includes("new-features") ? STAGING_PK : PROD_PK);

  return <CheckoutClient publishableKey={publishableKey} />;
}

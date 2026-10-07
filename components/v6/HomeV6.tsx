"use client";

// /v6 homepage root: the v5 page with a product-led hero (a live certificate
// that fills in from the finder) and a drifting photo mosaic in place of the
// industry spotlight, role marquee and pill cloud. Everything else — the
// state-map course finder, popular rail, stats, team dashboard, how it
// works, testimonials, FAQ, closing CTA — is shared with v5.

import { useCallback, useEffect, useState } from "react";
import type { Course, FaqGroup, HomePage as HomePageDoc, Testimonial, TrustLogo } from "@/lib/sanity";
import { useCart } from "@/components/cart/CartContext";
import { FinderV5Provider, type FinderMarketplace } from "@/components/v5/FinderContext";
import type { Audience } from "@/components/v5/HeroV5";
import TrustStrip from "@/components/v5/TrustStrip";
import CourseExplorer from "@/components/v5/CourseExplorer";
import PopularRail from "@/components/v5/PopularRail";
import StatsBand from "@/components/v5/StatsBand";
import TeamsSplit from "@/components/v5/TeamsSplit";
import HowItWorks from "@/components/v5/HowItWorks";
import TestimonialsV5 from "@/components/v5/TestimonialsV5";
import FaqV5 from "@/components/v5/FaqV5";
import FinalCta from "@/components/v5/FinalCta";
import CertificateHero from "./CertificateHero";
import RoleMosaic from "./RoleMosaic";
import "@/components/v5/v5.css";
import "./v6.css";

type CompanyStat = { value: string; label: string };

export type HomeV6Props = {
  courses: Course[];
  testimonials: Testimonial[];
  faqs: FaqGroup[];
  companyStats: CompanyStat[];
  trustLogos: TrustLogo[];
  home: HomePageDoc | null;
  marketplace: FinderMarketplace;
  phone: string;
  email: string;
};

const POPULAR_SLUGS = ["food-handler", "alcohol", "food-manager", "sexual-harassment", "tabc", "rbs"];

export default function HomeV6({
  courses,
  testimonials,
  faqs,
  companyStats,
  trustLogos,
  home,
  marketplace,
  phone,
  email
}: HomeV6Props) {
  const { buyer, setAudience: setCartAudience } = useCart();
  const [audience, setAudienceState] = useState<Audience>("self");

  useEffect(() => {
    setAudienceState(buyer.audience === "company" ? "team" : "self");
  }, [buyer.audience]);

  const chooseAudience = useCallback(
    (a: Audience) => {
      setAudienceState(a);
      setCartAudience(a === "team" ? "company" : "individual");
    },
    [setCartAudience]
  );

  const popularSlugs = home?.popularSlugs?.length ? home.popularSlugs : POPULAR_SLUGS;
  const featured = testimonials.filter((t) => t.featured);
  const quotes = featured.length ? featured : testimonials;
  const faqItems = (faqs[0]?.items || []).slice(0, 6);

  return (
    <FinderV5Provider marketplace={marketplace}>
      <div className="v5 v6">
        <CertificateHero audience={audience} onAudience={chooseAudience} companyStats={companyStats} />
        <TrustStrip logos={trustLogos} />
        <RoleMosaic />
        <CourseExplorer />
        <PopularRail courses={courses} slugs={popularSlugs} />
        <StatsBand stats={companyStats} />
        <TeamsSplit onAudience={chooseAudience} />
        <HowItWorks audience={audience} />
        <TestimonialsV5 items={quotes} companyStats={companyStats} />
        <FaqV5 items={faqItems} />
        <FinalCta phone={phone} email={email} />
      </div>
    </FinderV5Provider>
  );
}

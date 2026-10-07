"use client";

// /v5 homepage root. Owns the audience (mirrored into the cart, like the
// canonical home page does) and wraps everything in the finder provider so
// the hero bar, accordion, explorer and closing CTA share one selection.

import { useCallback, useEffect, useState } from "react";
import type { Course, FaqGroup, HomePage as HomePageDoc, Testimonial, TrustLogo } from "@/lib/sanity";
import { useCart } from "@/components/cart/CartContext";
import { FinderV5Provider, type FinderMarketplace } from "./FinderContext";
import HeroV5, { type Audience } from "./HeroV5";
import TrustStrip from "./TrustStrip";
import CourseExplorer from "./CourseExplorer";
import PopularRail from "./PopularRail";
import StatsBand from "./StatsBand";
import RolesMarquee from "./RolesMarquee";
import TeamsSplit from "./TeamsSplit";
import HowItWorks from "./HowItWorks";
import TestimonialsV5 from "./TestimonialsV5";
import FaqV5 from "./FaqV5";
import FinalCta from "./FinalCta";
import "./v5.css";

type CompanyStat = { value: string; label: string };

export type HomeV5Props = {
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

export default function HomeV5({
  courses,
  testimonials,
  faqs,
  companyStats,
  trustLogos,
  home,
  marketplace,
  phone,
  email
}: HomeV5Props) {
  const { buyer, setAudience: setCartAudience } = useCart();
  const [audience, setAudienceState] = useState<Audience>("self");

  // The cart is the source of truth for who's buying; the hero toggle just
  // writes to it. Mirror it back so a returning team buyer lands on team copy.
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
      <div className="v5">
        <HeroV5 audience={audience} onAudience={chooseAudience} companyStats={companyStats} />
        <TrustStrip logos={trustLogos} />
        <CourseExplorer />
        <PopularRail courses={courses} slugs={popularSlugs} />
        <StatsBand stats={companyStats} />
        <RolesMarquee />
        <TeamsSplit onAudience={chooseAudience} />
        <HowItWorks audience={audience} />
        <TestimonialsV5 items={quotes} companyStats={companyStats} />
        <FaqV5 items={faqItems} />
        <FinalCta phone={phone} email={email} />
      </div>
    </FinderV5Provider>
  );
}

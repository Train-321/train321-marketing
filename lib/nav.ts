// Marketing-site nav config. Imported by SiteHeader and SiteFooter.

export type NavLink = {
  label: string;
  to: string;
  icon?: string;
};

export type NavGroup = {
  heading: string;
  links: NavLink[];
};

export type NavItem = {
  label: string;
  to?: string;
  children?: NavGroup[];
};

export const marketingNav: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "Courses",
    children: [
      {
        heading: "Compliance courses",
        links: [
          { label: "Food Handler", to: "/courses/food-handler", icon: "fas fa-utensils" },
          { label: "Food Manager", to: "/courses/food-manager", icon: "fas fa-user-tie" },
          { label: "Alcohol Safety", to: "/courses/alcohol", icon: "fas fa-wine-glass-alt" },
          { label: "Sexual Harassment", to: "/courses/sexual-harassment", icon: "fas fa-shield-alt" },
          { label: "Human Trafficking", to: "/courses/human-trafficking", icon: "fas fa-hands-helping" },
          { label: "Security Host", to: "/courses/security-host", icon: "fas fa-user-shield" },
          { label: "TABC", to: "/courses/tabc", icon: "fas fa-wine-bottle" }
        ]
      }
    ]
  },
  {
    label: "Services",
    children: [
      {
        heading: "For business",
        links: [
          // A nav item with children renders as a dropdown trigger rather than
          // a link, so the overview page needs its own entry here to stay
          // reachable from the bar.
          { label: "Services overview", to: "/services", icon: "fas fa-briefcase" },
          { label: "Licensing", to: "/services/licensing", icon: "fas fa-id-card" },
          { label: "White Labeling", to: "/services/white-labeling", icon: "fas fa-paint-brush" }
        ]
      }
    ]
  },
  { label: "Demos", to: "/demo" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" }
];

export const footerNav = {
  company: [
    { label: "About Us", to: "/about" },
    { label: "Services", to: "/services" },
    { label: "Blog", to: "/blog" },
    { label: "Contact", to: "/contact" }
  ],
  support: [
    { label: "FAQ", to: "/faq" },
    { label: "Demos", to: "/demo" },
    { label: "Complaints & Appeals", to: "/legal/complaints-appeals" },
    { label: "Accessibility", to: "/legal/accessibility" },
    { label: "Non-Discrimination", to: "/legal/non-discrimination" }
  ],
  legal: [
    { label: "Privacy Policy", to: "/legal/privacy-policy" },
    { label: "Terms & Conditions", to: "/legal/terms-conditions" }
  ]
};

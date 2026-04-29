export const marketingNav = [
  { label: "Home", to: "/" },
  {
    label: "Courses",
    children: [
      {
        heading: "Food & beverage",
        links: [
          { label: "Food Handler", to: "/courses/food-handler", icon: "fas fa-utensils" },
          { label: "Food Manager", to: "/courses/food-manager", icon: "fas fa-user-tie" },
          { label: "Accredited Food Handler", to: "/courses/accredited-food-handler", icon: "fas fa-medal" },
          { label: "Alcohol Safety", to: "/courses/alcohol", icon: "fas fa-wine-glass-alt" },
          { label: "Bar Basics", to: "/courses/bar-basics", icon: "fas fa-glass-martini-alt" },
          { label: "Service Basics", to: "/courses/service-basics", icon: "fas fa-concierge-bell" }
        ]
      },
      {
        heading: "HR & compliance",
        links: [
          { label: "Human Resources", to: "/courses/human-resources", icon: "fas fa-users-cog" },
          { label: "Sexual Harassment", to: "/courses/sexual-harassment", icon: "fas fa-shield-alt" },
          { label: "California SH", to: "/courses/california-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "Illinois SH", to: "/courses/illinois-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "New York SH", to: "/courses/new-york-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "Human Trafficking", to: "/courses/human-trafficking", icon: "fas fa-hands-helping" }
        ]
      },
      {
        heading: "Safety & operations",
        links: [
          { label: "Safety Basics", to: "/courses/safety-basics", icon: "fas fa-hard-hat" },
          { label: "Security Host", to: "/courses/security-host", icon: "fas fa-user-shield" },
          { label: "Additional Courses", to: "/courses/additional-courses", icon: "fas fa-plus-circle" },
          { label: "Custom Courses", to: "/courses/custom-courses", icon: "fas fa-sliders-h" }
        ]
      },
      {
        heading: "For business",
        links: [
          { label: "Licensing", to: "/courses/licensing", icon: "fas fa-id-card" },
          { label: "White Labeling", to: "/courses/white-labeling", icon: "fas fa-paint-brush" },
          { label: "Browse all courses", to: "/catalog", icon: "fas fa-th" }
        ]
      }
    ]
  },
  { label: "Services", to: "/services" },
  { label: "Demos", to: "/demo" },
  { label: "Testimonials", to: "/testimonials" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" }
];

export const footerNav = {
  company: [
    { label: "About Us", to: "/about" },
    { label: "Services", to: "/services" },
    { label: "Testimonials", to: "/testimonials" },
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
    { label: "Terms & Conditions", to: "/legal/terms-conditions" },
    { label: "Refund Policy", to: "/legal/refund-policy" }
  ]
};

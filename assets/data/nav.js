export const marketingNav = [
  { label: "Home", to: "/" },
  {
    label: "Courses",
    children: [
      {
        heading: "Food & beverage",
        links: [
          { label: "Food Handler", to: "/food-handler", icon: "fas fa-utensils" },
          { label: "Food Manager", to: "/food-manager", icon: "fas fa-user-tie" },
          { label: "Accredited Food Handler", to: "/accredited-food-handler", icon: "fas fa-medal" },
          { label: "Alcohol Safety", to: "/alcohol", icon: "fas fa-wine-glass-alt" },
          { label: "Bar Basics", to: "/bar-basics", icon: "fas fa-glass-martini-alt" },
          { label: "Service Basics", to: "/service-basics", icon: "fas fa-concierge-bell" }
        ]
      },
      {
        heading: "HR & compliance",
        links: [
          { label: "Human Resources", to: "/human-resources", icon: "fas fa-users-cog" },
          { label: "Sexual Harassment", to: "/sexual-harassment", icon: "fas fa-shield-alt" },
          { label: "California SH", to: "/california-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "Illinois SH", to: "/illinois-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "New York SH", to: "/new-york-sexual-harassment", icon: "fas fa-map-marker-alt" },
          { label: "Human Trafficking", to: "/human-trafficking", icon: "fas fa-hands-helping" }
        ]
      },
      {
        heading: "Safety & operations",
        links: [
          { label: "Safety Basics", to: "/safety-basics", icon: "fas fa-hard-hat" },
          { label: "Security Host", to: "/security-host", icon: "fas fa-user-shield" },
          { label: "Additional Courses", to: "/additional-courses", icon: "fas fa-plus-circle" },
          { label: "Custom Courses", to: "/custom-courses", icon: "fas fa-sliders-h" }
        ]
      },
      {
        heading: "For business",
        links: [
          { label: "Licensing", to: "/licensing", icon: "fas fa-id-card" },
          { label: "White Labeling", to: "/white-labeling", icon: "fas fa-paint-brush" },
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
    { label: "Complaints & Appeals", to: "/complaints-appeals" },
    { label: "Accessibility", to: "/accessibility" },
    { label: "Non-Discrimination", to: "/non-discrimination" }
  ],
  legal: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms-conditions" },
    { label: "Refund Policy", to: "/refund-policy" }
  ]
};

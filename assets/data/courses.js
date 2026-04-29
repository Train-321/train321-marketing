// Course-family marketing pages — one entry per URL slug.
// Each entry drives a `CoursePage.vue` render, so content changes happen here,
// not in 18 near-identical .vue files.

export const courseFamilies = {
  "food-handler": {
    slug: "food-handler",
    title: "Food Handler Certification",
    eyebrow: "Food safety",
    tagline: "ANSI-accredited food safety training that pays for itself on day one.",
    hero: {
      stats: [
        { value: "2 hrs", label: "Total time" },
        { value: "48k+", label: "Certified this year" },
        { value: "50 states", label: "Accepted" }
      ]
    },
    enrollId: "food-handler",
    category: "food",
    color: "amber",
    icon: "fas fa-utensils",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    summary:
      "Train321's Food Handler course teaches the fundamentals every front-of-house and back-of-house team member needs: personal hygiene, safe temperatures, allergens, and cross-contamination. Certificate delivered the moment learners pass.",
    outcomes: [
      "Identify the six most common foodborne hazards and how to prevent each",
      "Hit correct holding, cooking, and cooling temperatures every shift",
      "Respond correctly when a guest declares a food allergy",
      "Pass your state food-handler exam on the first attempt"
    ],
    modules: [
      { title: "Foundations of food safety", duration: "18 min" },
      { title: "Personal hygiene & illness reporting", duration: "22 min" },
      { title: "Time & temperature control", duration: "28 min" },
      { title: "Cleaning, sanitizing & cross-contact", duration: "21 min" },
      { title: "Allergens & special diets", duration: "19 min" },
      { title: "Final exam (40 questions)", duration: "33 min" }
    ],
    accreditations: ["ANSI-accredited", "ServSafe-equivalent", "State-approved in 50 states"],
    certificate: {
      delivery: "Instant digital PDF",
      validity: "3 years (check your state)",
      accepted: "Every US state health department"
    },
    priceFrom: 14,
    faqs: [
      {
        q: "Is a Train321 food-handler card accepted in my state?",
        a: "Yes — our card is ANSI-accredited and accepted by every state health department. A handful of counties (e.g., Maricopa County, AZ) require a local card on top, and we link you to the right supplemental module inside the course."
      },
      {
        q: "How long does the course take?",
        a: "Most learners finish in a single sitting, about two hours end-to-end. You can pause anywhere — progress saves automatically."
      },
      {
        q: "What score do I need to pass?",
        a: "75% or better on the 40-question final. You get three attempts; most people pass on the first."
      }
    ]
  },

  "food-manager": {
    slug: "food-manager",
    title: "Food Manager Certification",
    eyebrow: "Food safety · management",
    tagline: "The manager credential every health inspector expects — proctored, ANSI-accredited, valid for 5 years.",
    hero: {
      stats: [
        { value: "8 hrs", label: "Self-paced prep" },
        { value: "5 yrs", label: "Certificate validity" },
        { value: "ANSI", label: "Accreditation" }
      ]
    },
    enrollId: "food-manager",
    category: "food",
    color: "amber",
    icon: "fas fa-user-tie",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    summary:
      "Prepare for the nationally recognized Food Manager exam with modules built around the 2022 FDA Food Code. Includes exam-day proctoring, 90-day retake guarantee, and a reference card learners actually keep on the line.",
    outcomes: [
      "Lead a HACCP-style food safety program for your operation",
      "Train and coach front-line food handlers on safe practices",
      "Pass the ANSI-accredited Certified Food Protection Manager exam",
      "Respond confidently to a health-department inspection"
    ],
    modules: [
      { title: "FDA Food Code overview", duration: "45 min" },
      { title: "Purchasing & receiving", duration: "40 min" },
      { title: "Active managerial control", duration: "55 min" },
      { title: "Facilities, pests & sanitation", duration: "50 min" },
      { title: "Crisis response & recall", duration: "35 min" },
      { title: "Practice exams (3 attempts)", duration: "2 hrs" },
      { title: "Proctored final exam", duration: "90 min" }
    ],
    accreditations: ["ANSI-accredited CFPM", "FDA Food Code 2022 aligned"],
    certificate: {
      delivery: "Physical + digital",
      validity: "5 years",
      accepted: "All US jurisdictions requiring a Certified Food Protection Manager"
    },
    priceFrom: 99,
    faqs: [
      {
        q: "Is the proctored exam included?",
        a: "Yes — the price includes one proctored exam attempt via our remote proctoring partner. Retakes within 90 days are free."
      },
      {
        q: "Do I need to travel to a testing center?",
        a: "No. The proctored exam runs in your browser with a webcam. All you need is a quiet room and ID."
      }
    ]
  },

  "accredited-food-handler": {
    slug: "accredited-food-handler",
    title: "Accredited Food Handler",
    eyebrow: "Food safety · accredited",
    tagline: "The accredited version of our Food Handler course — for states and employers that require it.",
    enrollId: "food-handler",
    category: "food",
    color: "amber",
    icon: "fas fa-medal",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    summary:
      "Identical content to our standard Food Handler course, but delivered under our ANSI National Accreditation Board (ANAB) accreditation. Required by a handful of jurisdictions (California, Texas, Illinois and others) and by employers with stricter compliance programs.",
    outcomes: [
      "Meet ANAB-accredited training requirements in California, Texas, Illinois, and beyond",
      "Earn a credential that satisfies stricter corporate compliance audits",
      "Receive a digital certificate accepted by every state health department"
    ],
    modules: [
      { title: "Foundations of food safety", duration: "18 min" },
      { title: "Personal hygiene & illness reporting", duration: "22 min" },
      { title: "Time & temperature control", duration: "28 min" },
      { title: "Cleaning, sanitizing & cross-contact", duration: "21 min" },
      { title: "Allergens & special diets", duration: "19 min" },
      { title: "State-specific supplement", duration: "15 min" },
      { title: "Accredited final exam", duration: "40 min" }
    ],
    accreditations: ["ANAB-accredited (ANSI National Accreditation Board)", "State-approved in all required jurisdictions"],
    certificate: {
      delivery: "Instant digital PDF",
      validity: "3 years",
      accepted: "All accredited-required jurisdictions"
    },
    priceFrom: 19
  },

  "alcohol": {
    slug: "alcohol",
    title: "Alcohol Safety Training",
    eyebrow: "Responsible alcohol service",
    tagline: "TIPS-equivalent responsible alcohol service training — state-approved in all alcohol jurisdictions.",
    hero: {
      stats: [
        { value: "90 min", label: "Average time" },
        { value: "41k+", label: "Certified this year" },
        { value: "48 states", label: "Approved" }
      ]
    },
    enrollId: "alcohol",
    category: "alcohol",
    color: "plum",
    icon: "fas fa-wine-glass-alt",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
    summary:
      "Spot fake IDs, recognize visible intoxication, refuse a sale without losing the guest. Required in most states for anyone who serves or sells alcohol — and cheap insurance for the states where it's \"strongly recommended.\"",
    outcomes: [
      "Verify age and detect altered or fake IDs",
      "Recognize the stages of intoxication and intervene early",
      "Refuse service with confidence — and without escalation",
      "Document incidents in a way that protects you and your license"
    ],
    modules: [
      { title: "Alcohol law in your state", duration: "25 min" },
      { title: "ID verification", duration: "20 min" },
      { title: "Recognizing intoxication", duration: "30 min" },
      { title: "Responsible refusal & intervention", duration: "20 min" },
      { title: "Final exam", duration: "25 min" }
    ],
    accreditations: ["TIPS-equivalent", "State-approved in 48 states"],
    certificate: {
      delivery: "Instant digital + wallet card",
      validity: "2-3 years (varies by state)",
      accepted: "All states requiring seller/server training"
    },
    priceFrom: 15
  },

  "bar-basics": {
    slug: "bar-basics",
    title: "Bar Basics",
    eyebrow: "Bar operations",
    tagline: "The bar opener-to-closer playbook: prep, pours, pace, and pass-down.",
    enrollId: "alcohol",
    category: "alcohol",
    color: "plum",
    icon: "fas fa-glass-martini-alt",
    image: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80",
    summary:
      "A practical, non-certification course that teaches new bartenders and barbacks how a well-run bar works — from stocking a well to closing the books. Pairs well with Alcohol Safety for full compliance.",
    outcomes: [
      "Open and close a bar without leaving surprises for the next shift",
      "Pour with consistent speed and cost control",
      "Handle a three-deep rail without losing your head",
      "Communicate cleanly with servers and the kitchen"
    ],
    modules: [
      { title: "Opening checklist", duration: "15 min" },
      { title: "Pour cost & control", duration: "25 min" },
      { title: "Speed techniques", duration: "20 min" },
      { title: "Guest recovery", duration: "20 min" },
      { title: "Close-out & pass-down", duration: "20 min" }
    ],
    priceFrom: 12
  },

  "service-basics": {
    slug: "service-basics",
    title: "Service Basics",
    eyebrow: "Front-of-house",
    tagline: "Confidence-building fundamentals for new servers and hosts.",
    enrollId: "food-handler",
    category: "food",
    color: "amber",
    icon: "fas fa-concierge-bell",
    image: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=80",
    summary:
      "Service isn't a personality — it's a repeatable set of moves. This course covers greeting, table management, upselling without being pushy, handling complaints, and running a section on a busy Saturday.",
    outcomes: [
      "Greet, seat, and read a table correctly",
      "Upsell appetizers and wine without feeling slimy",
      "Handle a guest complaint so they come back",
      "Run a 6-top section during a rush without a ticket getting lost"
    ],
    modules: [
      { title: "First impressions", duration: "15 min" },
      { title: "Running a section", duration: "25 min" },
      { title: "The art of the suggestive sell", duration: "20 min" },
      { title: "Service recovery", duration: "20 min" },
      { title: "Final assessment", duration: "15 min" }
    ],
    priceFrom: 12
  },

  "safety-basics": {
    slug: "safety-basics",
    title: "Safety Basics",
    eyebrow: "Workplace safety",
    tagline: "OSHA-aligned foundations for any workplace — slips, lifts, knives, fires, first aid.",
    enrollId: "food-handler",
    category: "food",
    color: "amber",
    icon: "fas fa-hard-hat",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    summary:
      "A broad workplace-safety primer that satisfies the \"we trained them on safety\" requirement most operations need. Focused on real incidents that actually happen in restaurants, retail, and service: slips, burns, lifts, knife cuts.",
    outcomes: [
      "Recognize the most common workplace hazards in service environments",
      "Perform safe lifts and avoid the most common back injuries",
      "Respond correctly to a burn, cut, or fall",
      "Know when to call 911, when to file, and when to clean and keep going"
    ],
    modules: [
      { title: "Workplace hazard awareness", duration: "25 min" },
      { title: "Slips, trips & falls", duration: "15 min" },
      { title: "Burns, cuts & knife safety", duration: "25 min" },
      { title: "Lifting & back care", duration: "15 min" },
      { title: "Basic first aid response", duration: "20 min" }
    ],
    priceFrom: 14
  },

  "security-host": {
    slug: "security-host",
    title: "Security Host / Door Host",
    eyebrow: "Venue security",
    tagline: "De-escalation, crowd management, and lawful refusal for bars, clubs, and event venues.",
    enrollId: "alcohol",
    category: "alcohol",
    color: "plum",
    icon: "fas fa-user-shield",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    summary:
      "Written for doormen, security hosts, and club staff in states that require security training. Focused on keeping everyone — guests, staff, the venue's liquor license — safe and within the law.",
    outcomes: [
      "De-escalate an escalating guest before it becomes an incident",
      "Refuse entry lawfully and without discrimination",
      "Manage a crowded entrance and fire-code occupancy",
      "Document and report incidents in a way that holds up"
    ],
    modules: [
      { title: "Legal foundations for venue security", duration: "25 min" },
      { title: "Reading a crowd", duration: "20 min" },
      { title: "De-escalation scripts", duration: "30 min" },
      { title: "Use of force limits", duration: "20 min" },
      { title: "Incident documentation", duration: "15 min" }
    ],
    priceFrom: 19
  },

  "human-resources": {
    slug: "human-resources",
    title: "Human Resources Training",
    eyebrow: "HR · management",
    tagline: "The HR essentials every manager needs — hiring, firing, discipline, documentation, done right.",
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-users-cog",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    summary:
      "A practical HR curriculum for operators and shift managers, built around the situations that actually cost small businesses money — wage-and-hour mistakes, bad documentation, discrimination blind spots, and the hiring interview that ends in a lawsuit.",
    outcomes: [
      "Run a legal, bias-resistant interview",
      "Document performance issues so a decision sticks",
      "Handle a complaint without creating a retaliation claim",
      "Navigate termination conversations professionally"
    ],
    modules: [
      { title: "Hiring & interviewing legally", duration: "30 min" },
      { title: "Wage & hour fundamentals", duration: "25 min" },
      { title: "Progressive discipline", duration: "25 min" },
      { title: "Investigating complaints", duration: "30 min" },
      { title: "Termination conversations", duration: "25 min" }
    ],
    priceFrom: 29
  },

  "sexual-harassment": {
    slug: "sexual-harassment",
    title: "Sexual Harassment Prevention",
    eyebrow: "HR · compliance",
    tagline: "Practical, jurisdiction-aware harassment prevention training — supervisor and employee versions.",
    hero: {
      stats: [
        { value: "60 min", label: "Employee version" },
        { value: "120 min", label: "Supervisor version" },
        { value: "5 states", label: "Mandated" }
      ]
    },
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-shield-alt",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    summary:
      "Satisfies the federal baseline and is pre-configured for the five states with specific mandates (CA, NY, IL, CT, DE). Supervisor version adds bystander intervention, reporting obligations, and investigation basics.",
    outcomes: [
      "Identify harassment in its subtler, real-world forms",
      "Intervene as a bystander without making things worse",
      "Know exactly how and where to report",
      "Understand the employer's obligation to investigate"
    ],
    modules: [
      { title: "What the law actually says", duration: "20 min" },
      { title: "Harassment in real situations", duration: "25 min" },
      { title: "Bystander intervention", duration: "20 min" },
      { title: "Reporting & retaliation", duration: "20 min" },
      { title: "Supervisor-only: investigations", duration: "35 min (supervisor)" }
    ],
    accreditations: ["CA SB 1343 compliant", "NY State & NYC compliant", "Illinois SHPA compliant", "Connecticut & Delaware compliant"],
    priceFrom: 19
  },

  "california-sexual-harassment": {
    slug: "california-sexual-harassment",
    title: "California Sexual Harassment Training",
    eyebrow: "CA · SB 1343",
    tagline: "SB 1343-compliant training for every California employer with 5+ employees.",
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-map-marker-alt",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80",
    summary:
      "California law requires 1 hour of training for every non-supervisory employee and 2 hours for every supervisor, every two years, for any employer with 5 or more employees. This course satisfies SB 1343 and is pre-loaded with California-specific examples, reporting paths, and the DFEH poster.",
    outcomes: [
      "Satisfy the SB 1343 requirement for supervisors or non-supervisors",
      "Understand FEHA's protected categories (broader than federal)",
      "Know exactly how and where to report in California",
      "Receive a certificate that satisfies audit requirements"
    ],
    modules: [
      { title: "SB 1343 in context", duration: "15 min" },
      { title: "FEHA protected categories", duration: "15 min" },
      { title: "California case studies", duration: "25 min" },
      { title: "Bystander intervention", duration: "15 min" },
      { title: "Reporting in California", duration: "20 min" }
    ],
    accreditations: ["SB 1343 compliant · CA DFEH"],
    priceFrom: 19
  },

  "illinois-sexual-harassment": {
    slug: "illinois-sexual-harassment",
    title: "Illinois Sexual Harassment Training",
    eyebrow: "IL · SHPA",
    tagline: "Illinois Sexual Harassment Prevention Act-compliant training for all Illinois employers.",
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-map-marker-alt",
    image: "https://images.unsplash.com/photo-1444664597500-035db93e2323?auto=format&fit=crop&w=800&q=80",
    summary:
      "Illinois requires annual sexual harassment prevention training for every employee of every Illinois employer — no headcount minimum. Restaurants have an additional supplement under the Illinois Liquor Control Act. This course covers both.",
    outcomes: [
      "Satisfy the Illinois SHPA annual requirement",
      "Meet the restaurant-industry supplement if your operation serves alcohol",
      "Understand IDHR's reporting channels"
    ],
    modules: [
      { title: "Illinois SHPA overview", duration: "15 min" },
      { title: "Illinois case studies", duration: "25 min" },
      { title: "Restaurant industry supplement", duration: "15 min" },
      { title: "Reporting to IDHR", duration: "15 min" }
    ],
    accreditations: ["SHPA compliant · IDHR"],
    priceFrom: 19
  },

  "new-york-sexual-harassment": {
    slug: "new-york-sexual-harassment",
    title: "New York Sexual Harassment Training",
    eyebrow: "NY · State & City",
    tagline: "Meets both the New York State and New York City annual training requirements.",
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-map-marker-alt",
    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80",
    summary:
      "New York State requires annual training for every employee. New York City adds additional requirements for employers with 15+ employees. This course satisfies both — with the NYC-specific bystander intervention content included.",
    outcomes: [
      "Satisfy NY State Labor Law §201-g annual training",
      "Satisfy NYC's Stop Sexual Harassment Act (if applicable)",
      "Know how to report to NY DOL or the NYC CCHR"
    ],
    modules: [
      { title: "NY State vs. NYC requirements", duration: "15 min" },
      { title: "New York case studies", duration: "25 min" },
      { title: "NYC bystander intervention supplement", duration: "15 min" },
      { title: "Reporting channels", duration: "15 min" }
    ],
    accreditations: ["NY State §201-g compliant", "NYC Stop Sexual Harassment Act compliant"],
    priceFrom: 19
  },

  "human-trafficking": {
    slug: "human-trafficking",
    title: "Human Trafficking Awareness",
    eyebrow: "Hospitality compliance",
    tagline: "Required in several states for hotels, motels, and hospitality staff. One hour. Handled.",
    enrollId: "sexual-harassment",
    category: "hr",
    color: "emerald",
    icon: "fas fa-hands-helping",
    image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
    summary:
      "Teaches hospitality staff how to recognize the signs of labor and sex trafficking, how to respond safely, and how to report. Satisfies mandates in Florida, California, Texas, and Connecticut, among others.",
    outcomes: [
      "Recognize common trafficking indicators in hospitality settings",
      "Respond without putting yourself, colleagues, or victims at risk",
      "Report to the right authority through the right channel",
      "Receive a certificate that satisfies state hospitality mandates"
    ],
    modules: [
      { title: "What trafficking looks like", duration: "20 min" },
      { title: "Indicators in hospitality", duration: "20 min" },
      { title: "Safe response protocols", duration: "15 min" },
      { title: "Reporting channels", duration: "10 min" }
    ],
    accreditations: ["FL Department of Business & Professional Regulation approved", "Accepted in CA, TX, CT"],
    priceFrom: 12
  },

  "additional-courses": {
    slug: "additional-courses",
    title: "Additional Courses",
    eyebrow: "Full catalog",
    tagline: "Can't find what you need? Here's everything else we offer — from cash handling to active-shooter response.",
    enrollId: "food-handler",
    category: "food",
    color: "neutral",
    icon: "fas fa-plus-circle",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80",
    summary:
      "Beyond our core compliance catalog, we offer specialized courses that operators request: cash handling, PCI basics, active-shooter response, workplace violence prevention, data privacy fundamentals, and more. If it exists on our platform and isn't in the main catalog, it's probably here.",
    outcomes: [
      "Browse a growing catalog of specialized training",
      "Bundle niche topics into a single company plan",
      "Request a topic we haven't built yet"
    ],
    priceFrom: 9
  },

  "custom-courses": {
    slug: "custom-courses",
    title: "Custom Courses",
    eyebrow: "Built for your brand",
    tagline: "We build training courses to your SOPs, in your voice, with your logo, on our platform.",
    enrollId: "food-manager",
    category: "food",
    color: "neutral",
    icon: "fas fa-sliders-h",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
    summary:
      "For operators with proprietary SOPs, brand-specific training, or multi-unit rollouts, we build custom courses end-to-end — scripting, voiceover, assessment design, LMS hosting. Projects typically ship in 4-6 weeks.",
    outcomes: [
      "Replace your SOP binder with a modern, trackable course",
      "Roll out consistent training across every location",
      "Track completion at the company, location, and employee level"
    ],
    priceFrom: null,
    priceNote: "Custom pricing — scopes start around $2,500 per course.",
    faqs: [
      {
        q: "How does the custom course process work?",
        a: "We start with a scoping call, then we draft a script from your SOPs. You review, we record voiceover and build the course in our platform, you approve, and we ship. Typical timeline: 4-6 weeks."
      },
      {
        q: "Do we own the course?",
        a: "You own the content. Train321 hosts and delivers it on our LMS for the duration of your license."
      }
    ]
  },

  "licensing": {
    slug: "licensing",
    title: "Licensing Train321",
    eyebrow: "For trade associations",
    tagline: "License our full catalog for your members — branded as yours.",
    enrollId: "food-manager",
    category: "food",
    color: "neutral",
    icon: "fas fa-id-card",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
    summary:
      "State restaurant associations, franchise organizations, and trade groups use Train321 as the training engine behind their member-facing brand. We handle the content, tech, and compliance; you handle the relationship.",
    outcomes: [
      "Offer a complete compliance catalog under your association's brand",
      "Track completion across your entire membership",
      "Get content updates as laws change — with no engineering lift"
    ],
    priceFrom: null,
    priceNote: "Licensing terms by association — contact us for a quote.",
    faqs: [
      {
        q: "Is this the same as white labeling?",
        a: "They're related. White labeling is for individual operators who want a branded LMS for their own staff. Licensing is for associations and multi-brand owners who need to offer training to members or franchisees."
      }
    ]
  },

  "white-labeling": {
    slug: "white-labeling",
    title: "White-Label Training",
    eyebrow: "Your brand, our engine",
    tagline: "Every course, delivered in your colors, at your URL, with your logo on the certificate.",
    enrollId: "food-manager",
    category: "food",
    color: "neutral",
    icon: "fas fa-paint-brush",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80",
    summary:
      "Multi-unit operators, franchisors, and consultants use our white-label to deliver training that looks like theirs. Your logo, your colors, your URL — and the Train321 compliance engine, accreditations, and reporting underneath.",
    outcomes: [
      "Deploy training that reinforces your brand, not ours",
      "Retain full control of the learner experience",
      "Get the same ANSI-accredited content, branded as yours"
    ],
    priceFrom: null,
    priceNote: "From $499/month — volume pricing above 250 seats."
  }
};

export const courseFamilyList = Object.values(courseFamilies);

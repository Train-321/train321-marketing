// Static blog posts. Add new entries here; slugs become /blog/:slug URLs.
// Body accepts an array of blocks: { type: 'p'|'h2'|'h3'|'ul'|'ol'|'quote'|'callout', content: ... }

export const blogPosts = [
  {
    slug: "californias-sb-1343-update-2026",
    title: "California's SB 1343 Update for 2026: What Operators Need to Know",
    excerpt:
      "California raised the bar again. Here's exactly what changed, who it applies to, and how to get your team compliant before the audit window closes.",
    category: "Compliance",
    author: {
      name: "Amelia Okafor",
      role: "Head of Compliance"
    },
    publishedAt: "2026-03-18",
    readMinutes: 6,
    heroTone: "accent",
    heroIcon: "fas fa-balance-scale",
    body: [
      { type: "p", content: "If you run a California business with five or more employees, SB 1343 already touches you. The 2026 amendments tighten three specific areas, and the compliance window closes July 1." },
      { type: "h2", content: "The three things that actually changed" },
      { type: "p", content: "Most of the amendments are clarifying language, but three changes are substantive and will show up in audits." },
      { type: "ol", content: [
        "Training frequency for supervisors promoted mid-cycle is now strictly 6 months, not \"within a reasonable time.\"",
        "Remote employees whose regular workplace is in California must receive California-compliant training even if the employer is out of state.",
        "Training records must be retained for three years, up from two."
      ]},
      { type: "callout", content: "If any part of your operation employs Californians remotely, you now have a California training obligation — regardless of your HQ state." },
      { type: "h2", content: "Who needs to act now" },
      { type: "p", content: "Any employer with five or more employees — full-time, part-time, temporary, or seasonal — whose workforce includes at least one California-based worker. The five-employee threshold counts your total workforce, not just your California headcount." },
      { type: "h3", content: "Supervisors need two hours" },
      { type: "p", content: "The supervisor version of the training runs two hours and must include content on bystander intervention, investigations, and what the law calls \"abusive conduct.\" The SB 1343 amendments don't change the runtime — they change who needs to be counted as a supervisor. If an employee directs the work of one or more subordinates, even informally, they're a supervisor under FEHA." },
      { type: "h3", content: "Non-supervisors need one hour" },
      { type: "p", content: "Every non-supervisor, every two years. The clock resets on the training completion date, not the hire date." },
      { type: "h2", content: "What to do this month" },
      { type: "ul", content: [
        "Run a headcount audit — include remote California workers.",
        "Pull training completion dates for every supervisor; flag any completed more than 23 months ago.",
        "Confirm your LMS retains records for at least three years.",
        "Verify the content of your current course matches the 2026 SB 1343 specification."
      ]},
      { type: "p", content: "Train321's California Sexual Harassment course is already updated for the 2026 amendments. If your team is trained on our platform, you're covered." }
    ]
  },
  {
    slug: "food-manager-exam-tips",
    title: "7 Things We Wish Every Food Manager Candidate Knew Before the Exam",
    excerpt:
      "We've proctored thousands of Food Manager exams. The candidates who pass the first time do these seven things. The ones who don't — usually miss the same three questions.",
    category: "Food safety",
    author: {
      name: "Dr. Sarah Chen",
      role: "Head of Curriculum"
    },
    publishedAt: "2026-03-04",
    readMinutes: 5,
    heroTone: "warn",
    heroIcon: "fas fa-clipboard-check",
    body: [
      { type: "p", content: "The ANSI-accredited Food Manager exam has a first-time pass rate of around 74%. That means one in four candidates has to sit it again — usually because of preventable mistakes. Here's our list of the seven habits that separate the 74% from the 26%." },
      { type: "h2", content: "1. Memorize the temperature danger zone — cold" },
      { type: "p", content: "41°F to 135°F is the canonical answer. Not 40, not 45, not 140. If a question mentions a specific temperature, it's testing whether you know the exact boundary." },
      { type: "h2", content: "2. Know the four-hour rule" },
      { type: "p", content: "Time as a public health control: food held between 41°F and 135°F must be discarded after 4 hours. Not 3, not 6. The number matters." },
      { type: "h2", content: "3. Internal cooking temperatures by food type" },
      { type: "ul", content: [
        "Poultry: 165°F for 15 seconds",
        "Ground meats: 155°F for 15 seconds",
        "Whole muscle pork, beef, fish: 145°F for 15 seconds",
        "Vegetables held for service: 135°F"
      ]},
      { type: "h2", content: "4. Answer Active Managerial Control questions by the book" },
      { type: "p", content: "AMC is the exam's favorite topic. The textbook answer is always: identify hazards, write procedures, train staff, monitor, correct, record. If you don't see a \"record\" component in an AMC answer, it's probably wrong." },
      { type: "h2", content: "5. Read the allergen questions twice" },
      { type: "p", content: "Allergen questions typically offer multiple \"reasonable\" answers. The correct one is almost always the most defensive — tell the kitchen, re-wash everything, use dedicated tools. If it saves the guest's life but slows service, pick it." },
      { type: "h2", content: "6. Don't over-think cross-contamination" },
      { type: "p", content: "The answer is usually: separate raw from ready-to-eat, top to bottom, and color-coded tools. If a question describes a complicated scenario, the fix is probably still one of those three." },
      { type: "h2", content: "7. Budget time — don't rush" },
      { type: "p", content: "You have 90 minutes for 80 questions. That's 67 seconds per question. Go fast on the questions you know, flag the ones you don't, come back with the 20 minutes you banked." },
      { type: "callout", content: "Our Food Manager course includes three practice exams with full explanations. Candidates who complete all three pass the real exam at a 94% rate." }
    ]
  },
  {
    slug: "rolling-out-training-across-locations",
    title: "Rolling Out Compliance Training Across Multiple Locations Without Losing Your Mind",
    excerpt:
      "14 locations, 340 employees, one week. Here's the playbook one of our customers used to hit 97% certification in 30 days — and what broke along the way.",
    category: "Operations",
    author: {
      name: "Michael Torres",
      role: "VP, Customer Success"
    },
    publishedAt: "2026-02-12",
    readMinutes: 8,
    heroTone: "positive",
    heroIcon: "fas fa-map-marked-alt",
    body: [
      { type: "p", content: "When Coastal Hospitality Group rolled Train321 out across 14 locations, they set a stretch goal: 90% certification within 30 days. They hit 97%. Here's what the playbook actually looked like, with the things that broke." },
      { type: "h2", content: "Week 1: Headcount and CSV upload" },
      { type: "p", content: "Every multi-unit rollout starts with a messy CSV. Coastal's HR system had different email addresses for some managers than their location POS — which meant the first import hit duplicates and a few dropped rows. Budget a day for data cleanup. It's less painful than recovering from duplicates later." },
      { type: "h3", content: "What broke" },
      { type: "p", content: "Three locations had shared generic emails like kitchen@store7.coastalhg.com. Those created shared training records and confused reporting. Fix: every learner gets an individual email address, even if it's a personal one." },
      { type: "h2", content: "Week 2: Manager kickoff" },
      { type: "p", content: "GMs got a 20-minute video briefing and a one-page FAQ. The briefing answered the three questions every GM asks: how long, on the clock or not, and what happens if someone fails." },
      { type: "callout", content: "Coastal's answer: 90 minutes, on the clock, and retakes are free — so just retake." },
      { type: "h2", content: "Week 3: Nudges and dashboards" },
      { type: "p", content: "By day 14 the rollout was at 62%. The GM weekly call turned into a dashboard review: which locations were behind, which learners hadn't started, who had started and stalled. Location GMs got competitive fast." },
      { type: "h2", content: "Week 4: Laggards" },
      { type: "p", content: "The last 20% is always the hardest. Coastal used three tools: a 1:1 from the GM for anyone at 0%, a \"finish by Friday and get a $25 gift card\" push for anyone partially complete, and a deadline conversation for the handful of employees who refused." },
      { type: "h2", content: "Results" },
      { type: "ul", content: [
        "97% certification in 30 days",
        "$22,400 saved vs. their prior training vendor",
        "One health-department visit passed without a finding the following quarter",
        "GMs reclaimed an estimated 10-20 hours per location, per year"
      ]},
      { type: "p", content: "The biggest surprise, according to their director of operations: \"We expected compliance. We got culture.\" When training actually works, teams notice." }
    ]
  },
  {
    slug: "fake-id-patterns-2026",
    title: "Fake ID Patterns We're Seeing in 2026 (And How to Spot Them)",
    excerpt:
      "Fake IDs have gotten significantly better. Here's what bartenders and door staff should look for this year — and the three-second check that catches most of them.",
    category: "Alcohol",
    author: {
      name: "Michael Torres",
      role: "VP, Customer Success"
    },
    publishedAt: "2026-01-28",
    readMinutes: 4,
    heroTone: "critical",
    heroIcon: "fas fa-id-card",
    body: [
      { type: "p", content: "We talk to hundreds of bar operators every year. The conversation about fake IDs has changed: five years ago it was \"kid with a laminated printout.\" Today it's \"scannable PVC, accurate hologram, passable UV pattern.\" Here's what to actually check." },
      { type: "h2", content: "The three-second physical check" },
      { type: "ol", content: [
        "Tilt the card. Real IDs have a layered laminate — the hologram shifts angle as you tilt. Fakes look flat.",
        "Run your thumbnail along the edge. Real state IDs are rigid; most fakes are slightly warped or soft along one edge.",
        "Look at the photo edges. On real IDs, the photo is fully integrated into the card surface. Fakes often show a subtle raised edge."
      ]},
      { type: "h2", content: "The 2026 patterns that are getting through" },
      { type: "p", content: "The most commonly flagged states this year: New Jersey, Illinois, and Pennsylvania. Not because those states are bad at security — because those templates happen to be the ones with the best-quality counterfeits circulating right now." },
      { type: "h2", content: "When the scanner matters" },
      { type: "p", content: "A PDF417 scanner catches most fakes because the barcode on the back has to match the printed data on the front. If your venue is high-volume or you're in a strict jurisdiction, a $300 scanner pays for itself the first time it catches a 19-year-old with a well-made PA fake." },
      { type: "callout", content: "Our Alcohol Safety course walks through real 2026 examples of every tier of fake — from the laminated printout to the fully convincing PVC. Servers who complete the course spot fakes at 3-4x the rate of untrained staff." }
    ]
  },
  {
    slug: "why-we-built-train321",
    title: "Why We Built Train321: A Note From Our CEO",
    excerpt:
      "Compliance training shouldn't feel like a tax. Here's the story of why we started Train321 — and what we refuse to compromise on.",
    category: "Company",
    author: {
      name: "Jason Smith",
      role: "President & CEO"
    },
    publishedAt: "2026-01-08",
    readMinutes: 4,
    heroTone: "accent",
    heroIcon: "fas fa-heart",
    body: [
      { type: "p", content: "I grew up in restaurants. My family owned two of them — a diner my dad ran in the morning and a steakhouse my mom ran at night. When I was thirteen, I watched a health inspector close the diner for a day because none of the new hires had food-handler cards. My dad was livid. Not at the inspector — at the training vendor, which had lost the certificates in a paperwork mix-up." },
      { type: "p", content: "That's the world I built Train321 for." },
      { type: "h2", content: "What we refuse to compromise on" },
      { type: "ul", content: [
        "Content accuracy. Every course is written by a subject-matter expert and reviewed annually. When laws change, our courses change the same week.",
        "Learner experience. If a cook can't finish a course on their phone during prep, we've failed.",
        "Pricing transparency. No \"contact us for pricing.\" No per-feature upsells. You see the price before you buy."
      ]},
      { type: "p", content: "We're a small team. We're not going to be the biggest training platform. We are going to be the one that operators tell their peers about — because it worked the first time, and it worked on the worst day of the quarter." },
      { type: "p", content: "Thanks for being part of that. If there's something we can do better, my email's below." },
      { type: "p", content: "— Jason" }
    ]
  }
];

export function findPost(slug) {
  return blogPosts.find(p => p.slug === slug);
}

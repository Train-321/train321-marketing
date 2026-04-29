// Legal / policy pages driven by data. Each entry renders via LegalPage.vue.
// Content is summarized — real legal copy should be reviewed by counsel before publish.

export const legalPages = {
  "privacy-policy": {
    slug: "privacy-policy",
    title: "Privacy Policy",
    effectiveDate: "2026-01-01",
    intro:
      "Train321 (\"we,\" \"us,\" or \"our\") respects your privacy. This Privacy Policy explains what information we collect, how we use it, and your choices. By using Train321, you agree to the practices described below.",
    sections: [
      {
        heading: "1. Information we collect",
        blocks: [
          { type: "p", content: "We collect information that you provide directly — for example, your name, email address, employer, and payment information when you enroll in a course or buy a plan. We also collect information automatically, such as your IP address, browser type, and how you interact with our courses, to improve our platform and to confirm completion for compliance purposes." },
          { type: "ul", content: [
            "Account information: name, email, employer, role",
            "Learning activity: course completion, quiz scores, time spent",
            "Payment information: processed by our payment provider (we don't store card numbers)",
            "Technical data: IP address, device type, browser version"
          ]}
        ]
      },
      {
        heading: "2. How we use your information",
        blocks: [
          { type: "p", content: "We use your information to deliver our services, issue certificates, support compliance reporting to your employer (if applicable), improve our courses and platform, and communicate with you about updates that affect your training." },
          { type: "p", content: "We do not sell your personal information to third parties." }
        ]
      },
      {
        heading: "3. Sharing your information",
        blocks: [
          { type: "p", content: "We share your information only where necessary: with your employer when they have purchased training on your behalf, with trusted service providers (payment, email, hosting) under strict confidentiality, and where required by law." }
        ]
      },
      {
        heading: "4. Data retention",
        blocks: [
          { type: "p", content: "We retain your course completion records for the lifetime of your certificate plus three years, to support compliance audits and to re-issue certificates on request. Account information is retained until you request deletion." }
        ]
      },
      {
        heading: "5. Your rights",
        blocks: [
          { type: "p", content: "Depending on your jurisdiction (CCPA in California, GDPR in Europe, and similar laws elsewhere), you may have the right to access, correct, delete, or port your personal information. To make a request, email privacy@train321.com." }
        ]
      },
      {
        heading: "6. Contact us",
        blocks: [
          { type: "p", content: "Questions about this Privacy Policy? Email privacy@train321.com or write to Train321 Privacy, 561-325-7300." }
        ]
      }
    ]
  },

  "terms-conditions": {
    slug: "terms-conditions",
    title: "Terms & Conditions",
    effectiveDate: "2026-01-01",
    intro:
      "These Terms & Conditions govern your use of Train321's website, courses, and services. By enrolling in a course or creating an account, you agree to these terms.",
    sections: [
      {
        heading: "1. Accounts",
        blocks: [
          { type: "p", content: "You are responsible for the accuracy of the information you provide, for maintaining the confidentiality of your login credentials, and for all activity on your account. Training records are issued in your name based on the information you provide." }
        ]
      },
      {
        heading: "2. Course enrollment",
        blocks: [
          { type: "p", content: "When you enroll, you receive a non-transferable, revocable license to access the course and associated materials for personal or work-related training. You may not redistribute our content, record screen content for public use, or use our materials to train individuals outside your enrolled organization." }
        ]
      },
      {
        heading: "3. Payment & refunds",
        blocks: [
          { type: "p", content: "All fees are charged at the time of purchase. Unused seats are refundable per our Refund Policy. Completed courses are non-refundable because the certificate has been issued." }
        ]
      },
      {
        heading: "4. Certificates",
        blocks: [
          { type: "p", content: "Certificates are issued based on your passing the required assessment. Certificates are meaningful only for the individual named on them; we will not issue a certificate to a person who did not personally complete the assessment." }
        ]
      },
      {
        heading: "5. Acceptable use",
        blocks: [
          { type: "p", content: "You agree not to: (a) share your account with others, (b) use automated tools to complete assessments, (c) redistribute course content, or (d) use our platform for any unlawful purpose. Violations may result in account termination without refund." }
        ]
      },
      {
        heading: "6. Limitation of liability",
        blocks: [
          { type: "p", content: "To the maximum extent permitted by law, Train321 is not liable for indirect, incidental, or consequential damages. Our total liability for any claim related to the service is limited to the amount you paid in the 12 months preceding the claim." }
        ]
      },
      {
        heading: "7. Contact",
        blocks: [
          { type: "p", content: "Questions? Email legal@train321.com." }
        ]
      }
    ]
  },

  "refund-policy": {
    slug: "refund-policy",
    title: "Refund Policy",
    effectiveDate: "2026-01-01",
    intro:
      "We want you to be satisfied with Train321. This policy explains when and how we issue refunds.",
    sections: [
      {
        heading: "Unused seats",
        blocks: [
          { type: "p", content: "Seats that have not been assigned to a learner and started are fully refundable within 60 days of purchase. Contact support@train321.com to initiate a refund; we process refunds to the original payment method within 5-7 business days." }
        ]
      },
      {
        heading: "Partially completed courses",
        blocks: [
          { type: "p", content: "If a learner has started a course but not passed the final exam, we may issue a prorated refund at our discretion. Transferring the seat to a different learner at no cost is usually the cleaner option — email us for help." }
        ]
      },
      {
        heading: "Completed courses",
        blocks: [
          { type: "p", content: "Once a learner has passed the final exam and a certificate has been issued, that course is not refundable. You are, of course, welcome to keep the certificate." }
        ]
      },
      {
        heading: "Annual plans & licenses",
        blocks: [
          { type: "p", content: "Business annual plans are refundable on a prorated basis within the first 30 days. After 30 days, plans auto-renew and may be cancelled to prevent future renewal but are not refundable." }
        ]
      },
      {
        heading: "How to request",
        blocks: [
          { type: "p", content: "Email support@train321.com with your order number and reason. Most requests are resolved the same business day." }
        ]
      }
    ]
  },

  "accessibility": {
    slug: "accessibility",
    title: "Accessibility Statement",
    effectiveDate: "2026-01-01",
    intro:
      "Train321 is committed to making our courses and website usable by everyone, regardless of ability or the technology they use.",
    sections: [
      {
        heading: "Our standard",
        blocks: [
          { type: "p", content: "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA for our website and course player. We test with screen readers (VoiceOver, NVDA), keyboard-only navigation, and high-contrast settings." }
        ]
      },
      {
        heading: "What this looks like in practice",
        blocks: [
          { type: "ul", content: [
            "All videos in our courses have closed captions and full transcripts",
            "Our course player supports keyboard-only navigation end-to-end",
            "Color contrast meets WCAG AA for all text and interactive elements",
            "Forms and controls have proper labels and focus indicators",
            "We avoid color as the sole indicator of state or action"
          ]}
        ]
      },
      {
        heading: "Known limitations",
        blocks: [
          { type: "p", content: "A handful of legacy courses (identified at the top of their description) still use Flash-era interactions and are being rebuilt on our modern player. If you need to take one of these courses and require assistance, contact support and we will provide an accessible alternative at no cost." }
        ]
      },
      {
        heading: "Contact",
        blocks: [
          { type: "p", content: "If you encounter an accessibility issue, please email accessibility@train321.com. We take every report seriously and aim to respond within one business day." }
        ]
      }
    ]
  },

  "non-discrimination": {
    slug: "non-discrimination",
    title: "Non-Discrimination Policy",
    effectiveDate: "2026-01-01",
    intro:
      "Train321 provides training and certification services without discrimination.",
    sections: [
      {
        heading: "Our commitment",
        blocks: [
          { type: "p", content: "Train321 does not discriminate on the basis of race, color, religion, national origin, age, sex, gender identity, gender expression, sexual orientation, disability, genetic information, marital status, veteran status, or any other legally protected category in the delivery of our training services, certification decisions, or the administration of our assessments." }
        ]
      },
      {
        heading: "Reasonable accommodation",
        blocks: [
          { type: "p", content: "Learners who require reasonable accommodations to complete our courses or assessments — for example, extended time, screen reader support, or an alternative assessment format — should email accessibility@train321.com before starting the course. We respond within one business day and have never denied a good-faith request." }
        ]
      },
      {
        heading: "Reporting discrimination",
        blocks: [
          { type: "p", content: "If you believe you have experienced discrimination on Train321, please email compliance@train321.com. Every report is reviewed by a senior team member and responded to within three business days." }
        ]
      }
    ]
  },

  "complaints-appeals": {
    slug: "complaints-appeals",
    title: "Complaints & Appeals",
    effectiveDate: "2026-01-01",
    intro:
      "We take complaints seriously. If you disagree with a certification decision or the quality of our services, here's how to raise it.",
    sections: [
      {
        heading: "How to file a complaint",
        blocks: [
          { type: "p", content: "Email complaints@train321.com with a description of the issue, your order number (if applicable), and the outcome you're seeking. We acknowledge every complaint within two business days." }
        ]
      },
      {
        heading: "How we investigate",
        blocks: [
          { type: "p", content: "Complaints are reviewed by a team member not involved in the original decision. For certification appeals, we review your assessment data, course records, and any flagged activity. For service complaints, we pull the relevant account logs and any communications on file." }
        ]
      },
      {
        heading: "Appeals of certification decisions",
        blocks: [
          { type: "p", content: "If you believe a failed assessment was scored incorrectly, you may appeal within 30 days of the attempt. We will re-grade by a second reviewer and respond within 10 business days. If the re-grade changes the outcome, we issue the certificate at no cost." }
        ]
      },
      {
        heading: "Unresolved concerns",
        blocks: [
          { type: "p", content: "If a complaint cannot be resolved to your satisfaction, you may escalate to our accrediting body. For ANSI-accredited courses: ANSI National Accreditation Board, accreditation@anab.org." }
        ]
      }
    ]
  }
};

export const legalList = Object.values(legalPages);

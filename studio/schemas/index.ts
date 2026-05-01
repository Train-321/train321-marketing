// ── Documents ─────────────────────────────────────────────────────────────
import siteSettings from './siteSettings'
import homePage from './homePage'
import contactPage from './contactPage'
import demoPage from './demoPage'
import servicesPage from './servicesPage'
import aboutPage from './aboutPage'
import blogIndexPage from './blogIndexPage'
import faqPage from './faqPage'
import catalogPage from './catalogPage'
import testimonialsPage from './testimonialsPage'
import detailPagesCopy from './detailPagesCopy'

import course from './course'
import blogPost from './blogPost'
import testimonial from './testimonial'
import faqItem from './faqItem'
import service from './service'
import legalPage from './legalPage'
import teamMember from './teamMember'

// ── Reusable objects ──────────────────────────────────────────────────────
import seo from './objects/seo'
import callToAction from './objects/callToAction'
import heroStat from './objects/heroStat'
import courseModule from './objects/courseModule'
import courseFaq from './objects/courseFaq'
import certificateInfo from './objects/certificateInfo'
import labeledStat from './objects/labeledStat'
import trustLogo from './objects/trustLogo'
import footerColumn from './objects/footerColumn'
import newsletter from './objects/newsletter'
import legalSection from './objects/legalSection'
import testimonialStat from './objects/testimonialStat'
import ctaBlock from './objects/ctaBlock'
import sectionHead from './objects/sectionHead'
import pillarCard from './objects/pillarCard'
import howItWorksStep from './objects/howItWorksStep'
import quickFaq from './objects/quickFaq'
import labeledTile from './objects/labeledTile'
import {
  blockParagraph,
  blockHeading2,
  blockHeading3,
  blockBulletList,
  blockOrderedList,
  blockCallout,
  blockQuote
} from './objects/bodyBlock'

export const schemaTypes = [
  // Singleton page documents
  siteSettings,
  homePage,
  contactPage,
  demoPage,
  servicesPage,
  aboutPage,
  blogIndexPage,
  faqPage,
  catalogPage,
  testimonialsPage,
  detailPagesCopy,

  // Content documents
  course,
  blogPost,
  testimonial,
  faqItem,
  service,
  legalPage,
  teamMember,

  // Reusable objects
  seo,
  callToAction,
  heroStat,
  courseModule,
  courseFaq,
  certificateInfo,
  labeledStat,
  trustLogo,
  footerColumn,
  newsletter,
  legalSection,
  testimonialStat,
  ctaBlock,
  sectionHead,
  pillarCard,
  howItWorksStep,
  quickFaq,
  labeledTile,

  // Body blocks (markdown-style structured content)
  blockParagraph,
  blockHeading2,
  blockHeading3,
  blockBulletList,
  blockOrderedList,
  blockCallout,
  blockQuote
]

// Client-safe support topics for the chat widget's fallback menu.
// Mirrors the canned support answers in chat-context.ts. Kept in a
// separate module so it can be imported from client components without
// dragging in the server-only content loader.

export type SupportTopic = {
  id: string;
  label: string;
  body: string;
};

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "cant-login",
    label: "Can't login",
    body: `If you forgot your password, click the "Forgot password" button next to the login. Most usernames are your email address — try resetting with your email first.

If you forgot your username, email [support@train321.com](mailto:support@train321.com) with your full name and the company you work for.`
  },
  {
    id: "copy-of-certificate",
    label: "Copy of certificate",
    body: `**Learners:** To view your certificate, log into your dashboard and click the "Certificates" tab on the left. Active certificates appear here. Click the green eye icon to view, or the orange download icon to download.

[Tutorial video](https://lms.train321.com/#/tour?id=cmv8wj7s)

If your account is no longer active and you need a certificate, email [support@train321.com](mailto:support@train321.com).

**Managers / admins:** To see all employee certificates, log into your dashboard, click "Certificates" → "Employee Certificates" from the dropdown. Click the blue detail button to choose a course, then the green icon to view a certificate, or "View Certificates" (top right) to view all.

[Manager tutorial video](https://lms.train321.com/#/tour?id=izmxu1lk)`
  },
  {
    id: "transfer-user",
    label: "Transfer user",
    body: `If you cannot add a user, they likely already have an account with Home of Training. Email [support@train321.com](mailto:support@train321.com) with the user's name and new location and we'll transfer them.`
  },
  {
    id: "wrong-language",
    label: "Course assigned in wrong language",
    body: `Email [support@train321.com](mailto:support@train321.com) with your full name, the course name, the company you work for, and your preferred language.`
  },
  {
    id: "health-inspector",
    label: "Health inspector at location",
    body: `We are the authorized training provider under **Ye Olde Falcon Pub, Certification #: 4077557**. This will be the last company on the list the inspector has. The certification number is on the bottom-right corner of every food handler certificate. Show the health inspector this information.`
  },
  {
    id: "schedule-food-manager",
    label: "Schedule Food Manager exam",
    body: `We have two options for food manager exams:

**1. Live proctored exam** — scheduled with us by emailing [support@train321.com](mailto:support@train321.com). Ensure your managers are assigned the "Food Manager – Study Session" course. *The study session is not the exam itself; we recommend 2–3 weeks of study before taking the exam.*

**2. Online proctored exam** — offered through Always Food Safe and ProctorU. The "Food Manager Online Exam" must be assigned to the user. We recommend 2–3 weeks of study before the exam.

Email [support@train321.com](mailto:support@train321.com) with any questions or to sign up.`
  },
  {
    id: "billing",
    label: "Billing questions",
    body: `For any billing questions, email [support@train321.com](mailto:support@train321.com).`
  },
  {
    id: "other",
    label: "Other",
    body: `For anything else, email [support@train321.com](mailto:support@train321.com) and we'll get back to you within one business day.`
  }
];

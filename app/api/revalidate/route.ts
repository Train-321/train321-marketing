import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.SANITY_REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!SECRET || auth !== `Bearer ${SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { _type?: string; slug?: { current?: string } } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { _type: type, slug } = body;
  const slugStr = slug?.current;
  const revalidated: string[] = [];

  const touch = (path: string, scope?: "page" | "layout") => {
    revalidatePath(path, scope);
    revalidated.push(path);
  };

  switch (type) {
    case "course":
      touch("/catalog");
      touch("/");
      if (slugStr) touch(`/courses/${slugStr}`);
      else touch("/courses/[slug]", "page");
      break;
    case "blogPost":
      touch("/blog");
      if (slugStr) touch(`/blog/${slugStr}`);
      else touch("/blog/[slug]", "page");
      break;
    case "legalPage":
      if (slugStr) touch(`/legal/${slugStr}`);
      else touch("/legal/[slug]", "page");
      break;
    case "faqItem":
      touch("/faq");
      touch("/");
      break;
    case "testimonial":
      touch("/");
      break;
    case "teamMember":
      touch("/about");
      break;
    case "siteSettings":
      touch("/", "layout");
      break;
    case "homePage":
      touch("/");
      break;
    case "contactPage":
      touch("/contact");
      break;
    case "demoPage":
      touch("/demo");
      break;
    case "servicesPage":
      touch("/services");
      break;
    case "aboutPage":
      touch("/about");
      break;
    case "blogIndexPage":
      touch("/blog");
      break;
    case "faqPage":
      touch("/faq");
      break;
    case "catalogPage":
      touch("/catalog");
      break;
    case "detailPagesCopy":
      touch("/courses/[slug]", "page");
      touch("/blog/[slug]", "page");
      touch("/legal/[slug]", "page");
      break;
    default:
      touch("/", "layout");
      break;
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, type, slug: slugStr });
}

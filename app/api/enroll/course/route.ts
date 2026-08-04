import { NextResponse } from "next/server";
import { getCartCourse, type CartCourse } from "@/lib/enroll";

// Re-hydrates cart lines. The browser stores only ids + seat counts, so on
// every page load it posts those ids here and gets back current names, prices,
// and images. Anything that no longer resolves is simply absent from the
// response, which the cart treats as "removed from the store" and drops.
export async function POST(request: Request) {
  try {
    const { ids } = (await request.json()) as { ids?: unknown };

    const wanted = Array.isArray(ids)
      ? Array.from(new Set(ids.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)))
      : [];

    // Bound the fan-out — a hand-crafted request shouldn't be able to make us
    // issue hundreds of upstream calls.
    const capped = wanted.slice(0, 50);

    const resolved = await Promise.all(capped.map((id) => getCartCourse(id)));
    const courses = resolved.filter((c): c is CartCourse => c !== null);

    return NextResponse.json({ courses });
  } catch {
    return NextResponse.json({ message: "We couldn't load your cart." }, { status: 500 });
  }
}

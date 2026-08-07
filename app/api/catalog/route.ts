import { NextResponse } from "next/server";
import { getMarketplaceCatalog } from "@/lib/newFeatures";

// Proxies the new-features marketplace catalog to the browser so the /catalog
// page can paginate (infinite scroll) and filter without hitting the backend
// cross-origin. Server-to-server fetch avoids CORS entirely.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("categoryId");

  const perPageParam = Number(searchParams.get("perPage") || 0);

  const data = await getMarketplaceCatalog({
    search: searchParams.get("search") || "",
    categoryId: categoryParam ? Number(categoryParam) : null,
    page: Number(searchParams.get("page") || 1),
    perPage: perPageParam > 0 ? Math.min(50, perPageParam) : undefined,
    stateCode: searchParams.get("stateCode") || null,
    anyState: searchParams.get("anyState") === "1"
  });

  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { fetchProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1") || 1;
    const per_page = Number(searchParams.get("per_page") ?? "12") || 12;
    const search = searchParams.get("search")?.trim() || undefined;
    const category = searchParams.get("category") ?? undefined;
    const featured = searchParams.get("featured") === "true";

    const { products, total } = await fetchProducts({
      page,
      per_page,
      search,
      category,
      featured,
    });

    return NextResponse.json(products, {
      headers: {
        "X-WP-Total": String(total),
      },
    });
  } catch (error) {
    const message =
      axios.isAxiosError(error) && error.response?.data
        ? String(
            (error.response.data as { message?: string }).message ??
              "WooCommerce request failed",
          )
        : error instanceof Error
          ? error.message
          : "WooCommerce request failed";

    return NextResponse.json(
      { error: message },
      { status: axios.isAxiosError(error) ? (error.response?.status ?? 502) : 502 },
    );
  }
}

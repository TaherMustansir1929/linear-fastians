import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");

  // Simple secret to prevent unauthorized revalidation if public
  // In this app, we call it internally or from actions, but for client-side triggered?
  // Actually, client cannot revalidatePath directly.
  // We should rely on Server Actions for revalidation.

  // However, for pure client-side hooks (like useUploadDocument which calls supabase directly),
  // we need a way to tell the server to revalidate.

  // const hasSecret = !!secret; // In real app use process.env.REVALIDATION_SECRET

  try {
    const body = await req.json();
    const path = body.path || "/dashboard";

    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (_err) {
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}

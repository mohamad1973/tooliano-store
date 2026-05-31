import { NextResponse } from "next/server";
import {
  isSessionResponse,
  requireApiDeliveryAgent,
} from "@/lib/auth/api-session";
import {
  confirmDeliveryByCode,
  recordFailedDeliveryAttempt,
} from "@/lib/delivery/confirm-code";

export async function POST(request: Request) {
  try {
    const session = await requireApiDeliveryAgent();
    if (isSessionResponse(session)) return session;

    const body = await request.json();
    const code = String(body.code ?? "");
    const codCollected = body.codCollected !== false;

    const result = await confirmDeliveryByCode({
      agentId: session.userId,
      code,
      codCollected,
    });

    if (!result.ok) {
      await recordFailedDeliveryAttempt(code);
      return NextResponse.json(
        { error: result.error, locked: result.locked },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true, orderId: result.orderId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

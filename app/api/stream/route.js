import { getUtcTimestamp } from "@/lib/crypto-utils";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const encoder = new TextEncoder();
  let interval;

  const stream = new ReadableStream({
    start(controller) {
      try {
        const initEvent = `data: ${JSON.stringify({
          type: "CONNECT_OK",
          text: `[${getUtcTimestamp()}] CONNECT_OK SSE pipe verified via Node cluster eu-central-1.`,
          level: "info",
        })}\n\n`;
        controller.enqueue(encoder.encode(initEvent));
      } catch {
        return;
      }

      let count = 0;
      interval = setInterval(() => {
        if (request.signal?.aborted) {
          clearInterval(interval);
          return;
        }

        count++;
        const ts = getUtcTimestamp();
        let eventPayload;

        if (count % 4 === 1) {
          eventPayload = {
            type: "MEMPOOL_DIGEST",
            text: `[${ts}] MEMPOOL_DIGEST Received transaction 0x4F9a71a8c9032... in mempool. Output match: 0.04520 BTC.`,
            level: "cyan",
          };
        } else if (count % 4 === 2) {
          eventPayload = {
            type: "BLOCK_MINED",
            text: `[${ts}] BLOCK_MINED Block 884912 confirmed (2/3 finality). Proof verified by peer nodes.`,
            level: "emerald",
          };
        } else if (count % 4 === 3) {
          eventPayload = {
            type: "STATE_UPDATE",
            text: `[${ts}] STATE_UPDATE Re-org depth safe. Awaiting terminal consensus (3/3).`,
            level: "amber",
          };
        } else {
          eventPayload = {
            type: "TELEMETRY_HEARTBEAT",
            text: `[${ts}] RPC_HEARTBEAT Node latency 31ms | Mempool weight: 1.42MB | Peering: 48 nodes.`,
            level: "info",
          };
        }

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(eventPayload)}\n\n`)
          );
        } catch {
          clearInterval(interval);
        }

        if (count >= 40) {
          clearInterval(interval);
          try {
            controller.close();
          } catch {}
        }
      }, 5000);

      // Clean up interval when browser closes connection or changes page
      request.signal?.addEventListener("abort", () => {
        clearInterval(interval);
      });
    },
    cancel() {
      clearInterval(interval);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

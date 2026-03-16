import { NextResponse } from 'next/server';
import { queryClient } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let controllerTarget: ReadableStreamDefaultController;
  
  const stream = new ReadableStream({
    start(controller) {
      controllerTarget = controller;
      
      // Send an initial heartbeat to open the connection
      controllerTarget.enqueue('event: connected\ndata: connection established\n\n');
    },
    cancel() {
      // Client disconnected
    }
  });

  // Since we might not have a postgres DB running locally yet to test,
  // we catch errors to prevent the entire stream from crashing.
  let listener: any = null;
  try {
    listener = await queryClient.listen('table_updates', (payload) => {
      // Push the raw payload down to the client as an SSE format event
      if (controllerTarget) {
        controllerTarget.enqueue(`event: update\ndata: ${payload}\n\n`);
      }
    });

    req.signal.addEventListener('abort', async () => {
      if (listener) {
        await listener.unlisten();
      }
    });
  } catch (error) {
    console.warn('Realtime (PostgreSQL Listen) is disabled or DB is completely unreachable.');
    // We don't crash, we just let the stream stay open so the frontend doesn't error out during UI dev.
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

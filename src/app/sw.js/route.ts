import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const dynamic = 'force-static';

export function GET() {
  const sw = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');

  return new Response(sw, {
    headers: {
      'content-type': 'application/javascript; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}

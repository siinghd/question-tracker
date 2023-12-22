import { handlers } from '@/auth';
import type { NextRequest } from 'next/server';

const { GET: AuthGET, POST } = handlers;
export { POST };

export async function GET(request: NextRequest) {
  const response = await AuthGET(request);

  return response;
}

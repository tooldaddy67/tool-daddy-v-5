import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware-auth';

// Example: Protect this API route
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult) return authResult; // Not authenticated

  // ...actual protected logic here...
  return NextResponse.json({ message: 'Authenticated access granted.' });
}

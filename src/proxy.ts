
import { NextResponse } from 'next/server';

export default function(request: Request) {
	// Allow all requests to proceed to the app
	return NextResponse.next();
}

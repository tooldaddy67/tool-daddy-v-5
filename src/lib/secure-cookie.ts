import { NextResponse } from 'next/server';

/**
 * Set a secure, httpOnly, SameSite=Strict, Secure cookie for tokens.
 * @param {NextResponse} response - The Next.js response object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Max age in seconds
 */
export function setSecureTokenCookie(response: NextResponse, name: string, value: string, maxAge: number = 60 * 60 * 24 * 7) {
  response.cookies.set(name, value, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
}
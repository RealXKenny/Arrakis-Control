
import { NextResponse } from 'next/server';
import { GET as handleCallback } from '../../../api/auth/callback/route';

export async function GET(request) {
    return handleCallback(request);
}

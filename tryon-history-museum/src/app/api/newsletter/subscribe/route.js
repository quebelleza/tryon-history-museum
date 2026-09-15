import { newsletter } from '@/lib/newsletter-server';
export const runtime = 'nodejs';
export async function POST(request) { return newsletter.subscribe(request); }

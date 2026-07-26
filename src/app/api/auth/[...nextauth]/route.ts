// Auth.js handlery (edge runtime – Cloudflare Pages).
import { handlers } from '@/auth';

export const runtime = 'edge';
export const { GET, POST } = handlers;

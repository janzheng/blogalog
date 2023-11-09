
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';

import cookie from 'cookie';
const ACCOUNT_COOKIE = env['ACCOUNT_COOKIE'];

// CORS
// import Blob from 'cross-blob';

const allowedOrigins = ['https://restfox.dev', 'https://blogalog.net'];


export const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

export async function corsHandler({ event, resolve }) {
  let origin = event.request.headers.get('Origin');

  // console.log("ORIGIN:", origin)
  // if (allowedOrigins.includes(origin)) {
    if (event.request.method !== 'OPTIONS') {
      const response = await resolve(event);
      for (const [key, value] of Object.entries(corsHeaders)) {
        response.headers.set(key, value);
      }
      response.headers.set('Access-Control-Allow-Origin', origin);
      return response;
    }

    console.log('[CORS] OPTIONS event.request.method', event.request.method);
    let optionsResponse = new Response('ok', { headers: corsHeaders });
    optionsResponse.headers.set('Access-Control-Allow-Origin', origin);
    return optionsResponse;
  // }


  const response = await resolve(event);
  return response;
};

export const handle = sequence(corsHandler);
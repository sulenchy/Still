import Stripe from 'npm:stripe@23.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://still-rg7h.onrender.com',
]);

const corsHeaders = 'authorization, x-client-info, apikey, content-type';

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': corsHeaders,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

async function signedInUser(request) {
  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization || !supabaseUrl || !supabaseAnonKey) return null;

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: supabaseAnonKey,
    },
  });
  if (!userResponse.ok) return null;
  const user = await userResponse.json();
  if (!user?.id) return null;
  return user;
}

async function billingRow(userId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Subscription settings are not configured.');
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?owner_id=eq.${encodeURIComponent(userId)}&select=provider_customer_id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      },
    },
  );
  if (!response.ok) throw new Error('Could not open subscription settings.');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

Deno.serve(async (request) => {
  const requestOrigin = request.headers.get('Origin') ?? '';
  const origin = allowedOrigins.has(requestOrigin) ? requestOrigin : 'http://localhost:5173';

  if (request.method === 'OPTIONS') {
    return json({ ok: true }, 200, origin);
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  const user = await signedInUser(request);
  if (!user) {
    return json({ error: 'Sign in to manage your subscription.' }, 401, origin);
  }

  try {
    const row = await billingRow(user.id);
    const customer = row?.provider_customer_id;
    const configuration = Deno.env.get('STRIPE_PORTAL_CONFIGURATION');
    if (!customer) {
      return json({ error: 'Start a subscription before managing it.' }, 409, origin);
    }
    if (!configuration || !Deno.env.get('STRIPE_SECRET_KEY')) {
      return json({ error: 'Subscription settings are not configured.' }, 500, origin);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer,
      configuration,
      return_url: `${origin}/dashboard?portal=return`,
    });
    if (!session.url) {
      return json({ error: 'Could not open subscription settings.' }, 500, origin);
    }
    return json({ url: session.url }, 200, origin);
  } catch (error) {
    console.error(error);
    return json({ error: 'Could not open subscription settings.' }, 500, origin);
  }
});

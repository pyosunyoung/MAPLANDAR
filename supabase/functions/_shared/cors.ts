export const corsHeaders = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
});

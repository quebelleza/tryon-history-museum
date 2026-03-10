import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = createClient()
  await supabase.from('members').select('id').limit(1)
  return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const therapeuticClass = searchParams.get('class');
    const isGeneric = searchParams.get('generic');

    let dbQuery = supabase
      .from('algerian_medicines')
      .select('*')
      .order('brand_name', { ascending: true })
      .limit(limit);

    if (query) {
      dbQuery = dbQuery.or(`brand_name.ilike.%${query}%,dci.ilike.%${query}%,brand_name_ar.ilike.%${query}%,dci_ar.ilike.%${query}%`);
    }

    if (therapeuticClass) {
      dbQuery = dbQuery.ilike('therapeutic_class', `%${therapeuticClass}%`);
    }

    if (isGeneric === 'true') {
      dbQuery = dbQuery.eq('is_generic', true);
    } else if (isGeneric === 'false') {
      dbQuery = dbQuery.eq('is_generic', false);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('Medicines search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ medicines: data || [] });
  } catch (error) {
    console.error('Medicines API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

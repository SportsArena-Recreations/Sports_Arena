import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hebicrniymjeiwwyrsak.supabase.co';
const supabaseKey = 'sb_publishable_44B7BQ8W-9ubDcUmyb7qSg_B2yiSDtd';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: matches } = await supabase.from('matches').select('*');
    console.log("MATCHES:", matches?.length);
    if (matches?.[0]) console.log("SAMPLE MATCH:", matches[0]);

    const { data: tourns } = await supabase.from('tournaments').select('*');
    console.log("TOURNAMENTS:", tourns?.length);
}

check();

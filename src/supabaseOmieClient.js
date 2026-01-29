import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL_OMIE = "https://yvwwqxunabvmmqzznrxl.supabase.co"
const SUPABASE_KEY_OMIE = "sb_publishable_ckUGvi64JZH1qIPCqlzwrQ_Oz8HcW4W"

export const supabaseOmie = createClient(SUPABASE_URL_OMIE, SUPABASE_KEY_OMIE)
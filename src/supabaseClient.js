import { createClient } from '@supabase/supabase-js'

// Substitua com os dados do seu painel do Supabase (Project Settings > API)
const supabaseUrl = 'https://citrhumdkfivdzbmayde.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpdHJodW1ka2ZpdmR6Ym1heWRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDgyNzUsImV4cCI6MjA4NDY4NDI3NX0.83x3-NrKoJgtIuSE7Jjsaj0zH-b-XJ3Z8i3XkBkwVoU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
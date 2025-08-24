// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ---------------- Supabase credentials ----------------
const SUPABASE_URL = "https://jpiygupirthrsvuxkqtj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwaXlndXBpcnRocnN2dXhrcXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjE2MTYsImV4cCI6MjA3MTI5NzYxNn0.4B_SmuDPDETxjAM-N9gCFWB-BnMOykjrgROQR19SA54";

// ---------------- Create client ----------------
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------- Export for use ----------------
export default supabaseClient;

// ---------------- Optional: expose for debugging ----------------
if (typeof window !== "undefined") {
  window.supabaseClient = supabaseClient;
  console.log("Supabase client ready:", supabaseClient);
}

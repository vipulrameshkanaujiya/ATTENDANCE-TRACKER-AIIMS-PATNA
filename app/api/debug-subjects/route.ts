import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("subjects").select("*");
  
  return NextResponse.json({ 
    user: user?.user?.id || null,
    success: !!data, 
    count: data?.length || 0, 
    data,
    error: error?.message || null 
  });
}
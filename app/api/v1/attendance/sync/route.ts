import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatTimeHHMM(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return timeStr;
}

function formatDateYYYYMMDD(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Validate API Key
    const expectedKey = process.env.DOCPREP_API_KEY;
    const authHeader = request.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const providedKey = match ? match[1].trim() : authHeader.trim();

    if (!expectedKey || !providedKey || providedKey !== expectedKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        {
          status: 401,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // 2. Parse Request Body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const { email, since } = body || {};

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = createAdminClient();

    // 3. Look up user by email
    const { data: userRecord, error: userError } = await supabase
      .from("users")
      .select("id, email, roll_number, batch_id, batch:batches(name)")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (userError || !userRecord) {
      return NextResponse.json(
        { error: "User not found" },
        {
          status: 404,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // 4. Query attendance records
    let query = supabase
      .from("attendance")
      .select(`
        id,
        status,
        class:classes!inner (
          id,
          date,
          start_time,
          topic,
          faculty,
          subject:subjects (
            name
          )
        )
      `)
      .eq("student_id", userRecord.id);

    if (since && typeof since === "string" && since.trim()) {
      query = query.gte("classes.date", since.trim());
    }

    const { data: attendanceData, error: attError } = await query;

    if (attError) {
      console.error("Error querying attendance for DocPrep sync:", attError);
      return NextResponse.json(
        { error: "Failed to fetch attendance data" },
        {
          status: 500,
          headers: { "Access-Control-Allow-Origin": "*" },
        }
      );
    }

    // 5. Format response
    const batchObj = Array.isArray(userRecord.batch) ? userRecord.batch[0] : userRecord.batch;
    const batchName = batchObj?.name || userRecord.roll_number || "";

    const lectures = (attendanceData || [])
      .filter((rec: any) => rec && rec.class)
      .map((rec: any) => ({
        id: rec.class.id || rec.id,
        date: formatDateYYYYMMDD(rec.class.date),
        time: formatTimeHHMM(rec.class.start_time),
        subject: rec.class.subject?.name || "General",
        topic: rec.class.topic || "",
        faculty: rec.class.faculty || "",
        status: (rec.status || "absent").toLowerCase(),
      }));

    // Sort chronologically by date ascending, then time ascending
    lectures.sort((a, b) => {
      const dComp = a.date.localeCompare(b.date);
      if (dComp !== 0) return dComp;
      return a.time.localeCompare(b.time);
    });

    return NextResponse.json(
      {
        user: {
          email: userRecord.email,
          roll_number: userRecord.roll_number || "",
          batch: batchName,
        },
        lectures,
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (err: any) {
    console.error("Unexpected error in DocPrep sync API:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

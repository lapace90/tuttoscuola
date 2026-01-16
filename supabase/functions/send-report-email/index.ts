// Deploy con: supabase functions deploy send-report-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TO_EMAIL = "lapace90@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, title, description, reporterName, reporterEmail } = await req.json();

    const typeLabels: Record<string, string> = {
      technical: "🔧 Problema Tecnico",
      suggestion: "💡 Suggerimento",
    };

    const subject = `[TuttoScuola] ${typeLabels[type] || type}: ${title}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3A8A; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">${typeLabels[type] || type}</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 10px 0; color: #1f2937;">${title}</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0; color: #374151; white-space: pre-wrap;">${description}</p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>Segnalato da:</strong> ${reporterName}<br>
              <strong>Email:</strong> ${reporterEmail}
            </p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Questa email è stata inviata automaticamente da TuttoScuola
          </p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TuttoScuola <noreply@resend.dev>",
        to: [TO_EMAIL],
        subject,
        html,
        reply_to: reporterEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
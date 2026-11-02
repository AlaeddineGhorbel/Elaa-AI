import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const jar = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    db: { schema: "elaa" },
    cookies: { getAll: () => jar.getAll(), setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)) }
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  const body = await request.json();
  const prompt = String(body.prompt ?? "").trim();
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  if (!prompt) return NextResponse.json({ error: "Message vide." }, { status: 400 });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "La clé Gemini manque dans la configuration serveur." }, { status: 503 });
  const contents = [...history, { role: "user", parts: [{ text: prompt }] }];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${key}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents, systemInstruction: { parts: [{ text: "Tu es Ghaffass, un assistant personnel francophone, clair, utile et respectueux. Réponds dans la langue de l’utilisateur." }] } })
  });
  const result = await response.json();
  if (!response.ok) return NextResponse.json({ error: result.error?.message || "Erreur du service IA." }, { status: 502 });
  const answer = result.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "Je n’ai pas de réponse pour le moment.";
  return NextResponse.json({ answer });
}

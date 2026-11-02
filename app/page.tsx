"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [session,setSession] = useState<any>(null);
  const [text,setText] = useState("");
  const [reply,setReply] = useState("");
  const [busy,setBusy] = useState(false);

  async function connect(create = false) {
    const result = create ? await supabase.auth.signUp({email,password}) : await supabase.auth.signInWithPassword({email,password});
    if (result.error) alert(result.error.message);
    else setSession(result.data.session);
  }
  async function send(e:any) {
    e.preventDefault(); if (!text.trim() || busy) return;
    setBusy(true); setReply("");
    const response = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:text})});
    const data = await response.json();
    setReply(response.ok ? data.answer : (data.error || "Erreur"));
    setBusy(false);
  }
  if (!session) return <main className="auth"><div className="brand">✦ GHAFFASS</div><h1>Votre assistant personnel</h1><p>Connectez-vous pour commencer.</p><input placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={()=>connect()}>Connexion</button><button className="secondary" onClick={()=>connect(true)}>Créer un compte</button></main>;
  return <main className="shell"><header><div><span className="brand">✦ GHAFFASS</span><small>Assistant personnel IA</small></div><button className="secondary compact" onClick={()=>supabase.auth.signOut().then(()=>setSession(null))}>Déconnexion</button></header><section className="hero"><div className="orb">✦</div><h1>Salem, je suis Ghaffass.</h1><p>Écris-moi et je t’aide à avancer.</p></section><section className="chat">{reply ? <article className="assistant"><b>Ghaffass</b><p>{reply}</p></article> : <div className="empty">Que puis-je faire pour vous aujourd’hui ?</div>}{busy && <div className="empty">Je réfléchis…</div>}</section><form className="composer" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Écris ton message…"/><button disabled={busy}>Envoyer ↑</button></form><footer>Prototype web en cours de développement.</footer></main>;
}

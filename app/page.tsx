"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [session,setSession] = useState<any>(null);
  const [text,setText] = useState("");
  const [reply,setReply] = useState("");
  const [busy,setBusy] = useState(false);
  const [listening,setListening] = useState(false);
  const [voice,setVoice] = useState<"masculine"|"feminine">("masculine");
  const recognition = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => setSession(data.session));
    const {data} = supabase.auth.onAuthStateChange((_event,s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  async function connect(create = false) {
    const result = create ? await supabase.auth.signUp({email,password}) : await supabase.auth.signInWithPassword({email,password});
    if (result.error) alert(result.error.message);
    else setSession(result.data.session);
  }
  async function ask(prompt:string) {
    if (!prompt.trim() || busy) return;
    setBusy(true); setReply("");
    try {
      const response = await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur du service");
      setReply(data.answer);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.answer); utterance.lang = "fr-FR";
        const french = speechSynthesis.getVoices().filter(v => v.lang.toLowerCase().startsWith("fr"));
        if (french.length) utterance.voice = french[voice === "feminine" ? Math.min(1,french.length-1) : 0];
        speechSynthesis.speak(utterance);
      }
    } catch (error:any) { setReply("Erreur : " + error.message); }
    setBusy(false);
  }
  async function send(e:any) { e.preventDefault(); const prompt=text; setText(""); await ask(prompt); }
  function toggleMic() {
    if (listening) { recognition.current?.stop(); setListening(false); return; }
    const API = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!API) { alert("La reconnaissance vocale n’est pas disponible dans ce navigateur. Essaie Chrome."); return; }
    const rec = new API(); rec.lang="fr-FR"; rec.continuous=true; rec.interimResults=true; recognition.current=rec;
    rec.onresult=(event:any)=>{
      const phrase=Array.from(event.results).map((r:any)=>r[0].transcript).join(" ").toLowerCase();
      if (phrase.includes("ya ghaffassa")) { setVoice("feminine"); rec.stop(); setListening(false); void ask("Je t’écoute."); }
      else if (phrase.includes("ya ghaffass")) { setVoice("masculine"); rec.stop(); setListening(false); void ask("Je t’écoute."); }
    };
    rec.onerror=()=>setListening(false); rec.onend=()=>setListening(false); rec.start(); setListening(true);
  }
  if (!session) return <main className="auth"><div className="brand">✦ GHAFFASS</div><h1>Votre assistant personnel</h1><p>Connectez-vous pour commencer.</p><input placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/><input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={()=>connect()}>Connexion</button><button className="secondary" onClick={()=>connect(true)}>Créer un compte</button></main>;
  return <main className="shell"><header><div><span className="brand">✦ GHAFFASS</span><small>Assistant personnel IA</small></div><button className="secondary compact" onClick={()=>supabase.auth.signOut()}>Déconnexion</button></header><section className="hero"><div className="orb">✦</div><h1>Salem, je suis Ghaffass.</h1><p>Dis « Ya Ghaffass » ou « Ya Ghaffassa » pour m’appeler.</p><div className="voicebuttons"><button onClick={toggleMic}>{listening ? "■ Arrêter le micro" : "◉ Activer le micro"}</button><span className={listening ? "live" : ""}>{listening ? "Écoute active" : "Micro désactivé"}</span></div></section><section className="chat">{reply ? <article className="assistant"><b>Ghaffass</b><p>{reply}</p></article> : <div className="empty">Que puis-je faire pour vous aujourd’hui ?</div>}{busy && <div className="empty">Je réfléchis…</div>}</section><form className="composer" onSubmit={send}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Écris ton message…"/><button disabled={busy}>Envoyer ↑</button></form><footer>La reconnaissance vocale du navigateur peut s’arrêter en arrière-plan ou écran verrouillé.</footer></main>;
}

# Ya Ghaffass — MVP web

Assistant IA francophone avec authentification Supabase, historique de conversations et déclenchement vocal dans le navigateur.

## Démarrage

1. Installer Node.js 20 ou plus récent.
2. Copier `.env.example` vers `.env.local` et renseigner les variables.
3. `npm install`
4. `npm run dev`
5. Ouvrir `http://localhost:3000`.

## Supabase

Le projet utilise le schéma `elaa` et les tables `conversations` et `messages` déjà configurées. L'utilisateur doit être connecté pour lire ou écrire ses données. Vérifier les règles RLS du projet avant toute mise en production.

## IA

`GEMINI_API_KEY` est exclusivement utilisée par la route serveur. Ne jamais la placer dans une variable `NEXT_PUBLIC_*`, ni la committer.

## Voix — limites à connaître

Le navigateur demande une autorisation micro et utilise Web Speech API quand elle est disponible. Les expressions « Ya Ghaffass » et « Ya Ghaffassa » sont des mots-clés de démarrage, respectivement voix masculine et féminine pour la synthèse vocale. Les navigateurs mobiles peuvent suspendre la reconnaissance lorsque l'écran est verrouillé ou l'application en arrière-plan. Un réveil permanent fiable nécessite une application Android native avec service au premier plan et détection locale adaptée.

## État

MVP en développement. Ne pas considérer comme prêt pour une écoute permanente ni pour une utilisation de production avant tests, audit RLS et configuration des secrets.

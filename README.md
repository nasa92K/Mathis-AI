# MATHIS AI

> **Built different. Powered by AI.**

Mathis AI est un chatbot web qui a une vraie personnalité : décontracté, drôle, très cultivé et fan d'automobile, de mécanique et d'aviation (surtout d'Ace Combat). Les réponses sont générées par un modèle de langage open source (`gpt-oss-120b`) via l'API gratuite de **Groq**, et s'affichent en streaming.

- **Frontend** : React + Vite (JavaScript), CSS moderne et responsive, icônes Lucide React
- **Backend** : Node.js + Express. C'est lui qui appelle l'API d'IA : la clé API ne quitte jamais le serveur.
- **Historique** : conversations enregistrées dans le `localStorage` du navigateur

---

## Arborescence

```
projet Mathis AI/
├── package.json                  # Scripts racine (lancer front + back en une commande)
├── README.md
├── .gitignore
│
├── server/                       # Backend Node.js / Express
│   ├── package.json
│   ├── .env.example              # Modèle de configuration (à copier en .env)
│   └── src/
│       ├── index.js              # Point d'entrée Express (CORS, JSON, routes, erreurs)
│       ├── config.js             # Lecture et validation des variables d'environnement
│       ├── prompts/
│       │   └── mathisPersonality.js   # ⭐ PROMPT SYSTÈME : la personnalité de Mathis AI
│       ├── services/
│       │   └── aiService.js      # Appel à l'API Groq (streaming) + traduction des erreurs
│       ├── middleware/
│       │   └── validateChat.js   # Validation des messages reçus
│       └── routes/
│           ├── chat.js           # POST /api/chat  → réponse en streaming (SSE)
│           └── health.js         # GET  /api/health → disponibilité de l'IA
│
└── client/                       # Frontend React / Vite
    ├── package.json
    ├── vite.config.js            # Proxy /api → backend (port 3001)
    ├── index.html
    ├── public/favicon.svg
    └── src/
        ├── main.jsx
        ├── App.jsx               # Mise en page + raccourcis clavier
        ├── App.css
        ├── styles/global.css     # Thème : couleurs, verre dépoli, animations
        ├── api/chatApi.js        # fetch + lecture du flux SSE
        ├── hooks/
        │   ├── useConversations.js   # Conversations + sauvegarde localStorage
        │   ├── useChat.js            # Envoi, arrêt, régénération
        │   ├── useSettings.js        # Paramètres utilisateur
        │   ├── useHealth.js          # Indicateur de disponibilité
        │   └── useSmoothText.js      # Apparition progressive du texte
        ├── utils/
        │   ├── helpers.js
        │   └── storage.js
        └── components/
            ├── Brand/            # Logo animé + avatar de Mathis
            ├── Sidebar/          # Historique, nouvelle conversation, renommer, supprimer
            ├── Welcome/          # Page d'accueil + suggestions cliquables
            ├── Chat/             # Messages, Markdown, blocs de code, indicateur de réflexion
            ├── Composer/         # Zone de saisie
            ├── Settings/         # Page de paramètres
            ├── Status/           # Pastille « En ligne / Hors ligne »
            └── ConfirmDialog/    # Fenêtre de confirmation
```

---

## Prérequis

- **Node.js 20 ou plus récent** (`node -v` pour vérifier)
- Une **clé API Groq** (gratuite, sans carte bancaire) : à créer sur <https://console.groq.com/keys>.

---

## Installation et lancement

Ouvre le dossier du projet dans Visual Studio Code, puis ouvre un terminal (`Ctrl + ù` ou *Terminal → Nouveau terminal*).

### 1. Installer les dépendances

```bash
npm run install:all
```

Cette commande installe les dépendances de la racine, du dossier `server` et du dossier `client`. Pour le faire à la main :

```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Configurer la clé API

Copie le fichier d'exemple :

```bash
# Windows (PowerShell)
Copy-Item server/.env.example server/.env

# macOS / Linux / Git Bash
cp server/.env.example server/.env
```

Ouvre ensuite `server/.env` et remplace la valeur de `GROQ_API_KEY` :

```env
GROQ_API_KEY=gsk_ta-vraie-cle
```

> ⚠️ Le fichier `.env` est ignoré par Git. Ne le partage jamais et ne mets jamais la clé dans le code du frontend.

### 3. Démarrer le backend

```bash
cd server
npm run dev
```

Le terminal affiche : `🚀 MATHIS AI — backend prêt sur http://localhost:3001`.

### 4. Démarrer le frontend

Dans un **deuxième terminal** :

```bash
cd client
npm run dev
```

### 5. Ouvrir Mathis AI

Va sur **<http://localhost:5173>** dans ton navigateur.

### Raccourci : tout lancer d'un coup

Depuis la racine du projet, cette commande démarre le backend et le frontend dans le même terminal :

```bash
npm run dev
```

---

## Mise en ligne sur HubSpot

Le site HubSpot n'héberge que l'interface. Le backend Express tourne ailleurs (Render), car HubSpot ne fait pas tourner de serveur Node.

1. **Backend** : pousser le projet sur GitHub, puis Render → *New* → *Blueprint* (lit `render.yaml`). Saisir `GROQ_API_KEY` dans Render. Vérifier que `CLIENT_ORIGIN` contient l'adresse du site HubSpot.
2. **Adresse du backend** : mettre l'URL Render dans `client/.env.hubspot` (`VITE_API_URL`).
3. **Interface** : `npm run deploy:hubspot` construit le bundle React dans `my-cms-theme/app/` et envoie le thème dans le Design Manager (CLI `hs`, compte déjà connecté).
4. La page HubSpot utilise le modèle **Mathis AI - Chatbot** (`my-cms-theme/templates/mathis-ai.html`). Après un nouveau déploiement, elle se met à jour toute seule.

> Sur l'offre gratuite de Render, le serveur s'endort après 15 min d'inactivité : le premier message peut mettre ~1 min à arriver.

---

## Personnaliser Mathis AI

Toute la personnalité se trouve dans un seul fichier :

**`server/src/prompts/mathisPersonality.js`**

- `MATHIS_PERSONALITY` contient le caractère, les expressions, les passions et les règles de comportement. Modifie ce texte puis enregistre : en mode `npm run dev`, le serveur redémarre tout seul.
- `RESPONSE_STYLES` définit les consignes de longueur (concis, équilibré, détaillé) qu'on choisit dans la page Paramètres.

Les autres réglages sont dans `server/.env` :

| Variable | Rôle | Défaut |
|---|---|---|
| `GROQ_API_KEY` | Clé API Groq (obligatoire, gratuite) | — |
| `GROQ_MODEL` | Modèle utilisé | `openai/gpt-oss-120b` |
| `MATHIS_EFFORT` | Profondeur de réflexion : `low`, `medium`, `high` | `medium` |
| `MAX_TOKENS` | Longueur maximale d'une réponse (en tokens) | `2048` |
| `MAX_HISTORY_CHARS` | Taille max de l'historique envoyé à l'IA (caractères) | `8000` |
| `PORT` | Port du backend | `3001` |
| `CLIENT_ORIGIN` | URLs du frontend autorisées (CORS), séparées par des virgules | `http://localhost:5173` |
| `TRUST_PROXY` | Nombre de proxys devant le serveur (`1` sur Render) | `0` |
| `RATE_LIMIT_PER_MINUTE` | Nombre de messages autorisés par minute et par IP | `20` |

> 💡 L'offre gratuite de Groq a des limites par minute et par jour (voir <https://console.groq.com/settings/limits>). `MAX_TOKENS` et `MAX_HISTORY_CHARS` sont réglés pour rester en dessous ; `MATHIS_EFFORT=low` économise encore des tokens.

---

## Fonctionnalités

**Discussion**
- Réponses en streaming, qui s'affichent progressivement (l'animation peut être désactivée)
- Rendu Markdown : titres, listes, tableaux, citations
- Blocs de code avec coloration syntaxique et bouton « Copier »
- Bouton pour copier une réponse, et bouton pour régénérer la dernière réponse
- Bouton **Arrêter** (ou touche `Échap`) pour couper la génération en cours
- Animation « Mathis AI réfléchit… », puis défilement automatique (il ne force pas le défilement si tu es remonté lire plus haut)

**Conversations**
- Historique dans la barre latérale, conservé après actualisation (`localStorage`)
- Création, renommage et suppression des conversations, avec confirmation avant suppression
- Le titre est généré automatiquement à partir du premier message

**Interface**
- Page d'accueil avec logo animé et quatre suggestions qui envoient directement le message
- Pastille de disponibilité de l'IA (en ligne, clé manquante, serveur hors ligne…)
- Page **Paramètres** : longueur des réponses, animation, envoi avec Entrée, état de l'IA, suppression de l'historique
- Responsive : sur mobile et tablette, la barre latérale devient un tiroir
- Utilisable au clavier : focus visible, fenêtres de confirmation accessibles, raccourcis

**Raccourcis clavier**

| Action | Raccourci |
|---|---|
| Envoyer | `Entrée` (ou `Ctrl + Entrée` selon les paramètres) |
| Nouvelle ligne | `Maj + Entrée` |
| Arrêter la génération | `Échap` |
| Nouvelle conversation | `Ctrl + Maj + O` |
| Aller dans la zone de saisie | `/` |

---

## Sécurité et gestion des erreurs

- La clé API reste dans `server/.env` et n'est utilisée que par le backend. Le navigateur ne parle qu'à `/api`.
- Chaque requête est validée : rôles autorisés, texte non vide, tailles limitées, conversation qui commence et se termine par un message utilisateur.
- Le nombre de messages par minute et par IP est limité (`express-rate-limit`).
- Le SDK relance automatiquement les requêtes en cas d'erreur temporaire (429, 5xx, coupure réseau).
- Les erreurs sont traduites en messages clairs en français (clé invalide, quota atteint, service surchargé, serveur injoignable…). Elles s'affichent dans une carte d'erreur avec un bouton **Réessayer**.
- Une erreur n'est **jamais** présentée comme une réponse de l'IA : elle s'affiche à part, et n'est pas renvoyée au modèle dans l'historique.

---

## API du backend

### `GET /api/health`

```json
{ "server": "ok", "ai": { "status": "online", "message": "Mathis AI est en ligne." }, "model": "openai/gpt-oss-120b", "effort": "low" }
```

Valeurs possibles de `ai.status` : `online`, `offline`, `not_configured`.

### `POST /api/chat`

Corps de la requête :

```json
{
  "messages": [
    { "role": "user", "content": "Tu penses quoi de la BMW M3 G80 ?" }
  ],
  "responseStyle": "balanced"
}
```

La réponse est un flux `text/event-stream`. Chaque événement est au format `data: {...}` :

```
data: {"type":"delta","text":"Tbh, la M3 G80 "}
data: {"type":"delta","text":"c'est une sacrée machine 💀"}
data: {"type":"done","stopReason":"stop","model":"openai/gpt-oss-120b"}
```

En cas d'erreur : `data: {"type":"error","code":"rate_limited","message":"..."}`.

---

## Dépannage

| Problème | Solution |
|---|---|
| Pastille « Clé API manquante » | Crée `server/.env` avec `GROQ_API_KEY`, puis redémarre le backend. |
| Pastille « Serveur hors ligne » | Le backend n'est pas lancé : `cd server && npm run dev`. |
| « La clé API est invalide » | Vérifie la clé sur console.groq.com et l'absence d'espaces autour. |
| « Trop de requêtes » | Attends une minute, ou augmente `RATE_LIMIT_PER_MINUTE`. |
| « Limite gratuite de l'IA atteinte » | Quota Groq épuisé : attends une minute (ou le lendemain), ou baisse `MAX_TOKENS` / `MAX_HISTORY_CHARS`. |
| Le port 3001 ou 5173 est déjà pris | Change `PORT` dans `.env`, et la cible du proxy dans `client/vite.config.js`. |

---

## Pistes d'évolution

- Recherche web (outil `web_search` de l'API) pour répondre sur l'actualité avec des sources
- Comptes utilisateurs et base de données à la place du `localStorage`
- Envoi d'images, par exemple pour diagnostiquer un voyant du tableau de bord
- Déploiement : `npm run build` génère `client/dist/`, à servir avec le backend ou sur un hébergeur statique

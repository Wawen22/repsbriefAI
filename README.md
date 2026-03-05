# RepsBrief

RepsBrief è una web app Next.js + Supabase per generare brief di contenuti da trend reali, con layer AI provider-agnostic (`getAIProvider()`).

## Avvio rapido

```bash
npm install
npm run dev
```

App locale: `http://localhost:3000`

## Switch AI Provider (solo via `.env`)

Il progetto non richiede modifiche al codice per cambiare provider AI: basta modificare variabili env e riavviare il server.

### 1) Variabili comuni

```env
AI_PROVIDER=azure   # openai | anthropic | gemini | azure | groq
AI_MODEL=gpt-5.3
```

### 2) Config provider

#### Azure Foundry / Azure OpenAI

```env
AI_PROVIDER=azure
AI_MODEL=gpt-5.3
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/openai/v1/
AZURE_OPENAI_API_VERSION=2024-05-01-preview
AZURE_OPENAI_FALLBACK_MODEL=gpt-5.2
```

Note:
- `AZURE_OPENAI_ENDPOINT` supporta sia formato Foundry (`.../openai/v1/`) sia endpoint legacy `cognitiveservices`.
- Se `AI_MODEL` non esiste sul resource (es. `gpt-5.3` non deployato), il provider prova automaticamente `AZURE_OPENAI_FALLBACK_MODEL`.

#### Gemini

```env
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=...
```

#### OpenAI

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=...
```

### 3) Dopo il cambio provider

1. Riavvia il dev server (`npm run dev`).
2. Genera un brief da dashboard.
3. Verifica che il brief venga salvato con `ai_provider` e `ai_model` corretti nella tabella `briefs`.

## Architettura AI

Tutte le chiamate AI passano da:

```ts
import { getAIProvider } from '@/lib/ai'
const ai = getAIProvider()
const response = await ai.complete(messages, options)
```

Non chiamare SDK AI direttamente fuori da `src/lib/ai/providers/`.

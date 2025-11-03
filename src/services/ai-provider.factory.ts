import { configManager } from '../config';
import { MistralService } from './mistral.service';
import { APIStructure } from '../types';

export interface AIProvider {
  analyzeDescription(description: string): Promise<APIStructure>;
}

export function createAIProvider(): AIProvider {
  const config = configManager.getConfig();
  const provider = config.aiProvider || 'mistral';

  switch (provider) {
    case 'groq':
      return createGroqService();
    case 'gemini':
      return createGeminiService();
    case 'ollama':
      return createOllamaService();
    case 'mistral':
    default:
      return new MistralService();
  }
}

function createGroqService(): AIProvider {
  try {
    const Groq = require('groq-sdk').default;
    const config = configManager.getConfig();
    const apiKey = process.env.GROQ_API_KEY || config.groqApiKey;

    if (!apiKey) {
      throw new Error(
        'Clé API Groq non configurée.\n\n' +
        'Solutions:\n' +
        '  1. Exécutez: ai-gen init\n' +
        '  2. Ou définissez: export GROQ_API_KEY=votre_clé\n' +
        '  3. Ou ajoutez "groqApiKey" dans ~/.ai-boilerplate-generator/config.json\n\n' +
        'Obtenez une clé gratuite: https://console.groq.com/keys'
      );
    }

    const client = new Groq({ apiKey });

    return {
      async analyzeDescription(description: string): Promise<APIStructure> {
        const prompt = buildPrompt(description);

        try {
          const response = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Modèle mis à jour (Dec 2024)
            messages: [
              { role: 'system', content: getSystemPrompt() },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          });

          const content = response.choices?.[0]?.message?.content;
          if (!content) throw new Error('Aucune réponse de Groq');

          const parsed = JSON.parse(content);
          return validateAndNormalize(parsed);
        } catch (error: any) {
          if (error.message?.includes('401')) {
            throw new Error('Clé API Groq invalide. Reconfigurez avec: ai-gen init');
          }
          throw error;
        }
      },
    };
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'Groq SDK non installé.\n\n' +
        'Pour utiliser Groq:\n' +
        '  1. npm install groq-sdk\n' +
        '  2. npm run build\n' +
        '  3. ai-gen generate\n\n' +
        'Consultez: SWITCH_TO_GROQ.md'
      );
    }
    throw error;
  }
}

function createGeminiService(): AIProvider {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const config = configManager.getConfig();
    const apiKey = process.env.GEMINI_API_KEY || config.geminiApiKey;

    if (!apiKey) {
      throw new Error(
        'Clé API Gemini non configurée.\n\n' +
        'Solutions:\n' +
        '  1. Exécutez: ai-gen init\n' +
        '  2. Ou définissez: export GEMINI_API_KEY=votre_clé\n\n' +
        'Obtenez une clé gratuite: https://aistudio.google.com/app/apikey'
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    return {
      async analyzeDescription(description: string): Promise<APIStructure> {
        const prompt = getSystemPrompt() + '\n\n' + buildPrompt(description);

        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const jsonMatch = text.match(/\{[\s\S]*\}/);
          const jsonStr = jsonMatch ? jsonMatch[0] : text;

          const parsed = JSON.parse(jsonStr);
          return validateAndNormalize(parsed);
        } catch (error: any) {
          if (error.message?.includes('API_KEY_INVALID')) {
            throw new Error('Clé API Gemini invalide. Reconfigurez avec: ai-gen init');
          }
          throw error;
        }
      },
    };
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'Google Generative AI SDK non installé.\n\n' +
        'Pour utiliser Gemini:\n' +
        '  1. npm install @google/generative-ai\n' +
        '  2. npm run build\n' +
        '  3. ai-gen generate'
      );
    }
    throw error;
  }
}

function createOllamaService(): AIProvider {
  try {
    const { Ollama } = require('ollama');
    const client = new Ollama({ host: 'http://localhost:11434' });

    return {
      async analyzeDescription(description: string): Promise<APIStructure> {
        const prompt = getSystemPrompt() + '\n\n' + buildPrompt(description);

        try {
          const response = await client.chat({
            model: 'llama3.1',
            messages: [{ role: 'user', content: prompt }],
            format: 'json',
          });

          const parsed = JSON.parse(response.message.content);
          return validateAndNormalize(parsed);
        } catch (error: any) {
          if (error.code === 'ECONNREFUSED') {
            throw new Error(
              'Impossible de se connecter à Ollama.\n\n' +
              'Assurez-vous que Ollama est démarré:\n' +
              '  1. ollama serve\n' +
              '  2. Dans un autre terminal: ai-gen generate'
            );
          }
          throw error;
        }
      },
    };
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        'Ollama SDK non installé.\n\n' +
        'Pour utiliser Ollama:\n' +
        '  1. Installer Ollama: curl -fsSL https://ollama.com/install.sh | sh\n' +
        '  2. npm install ollama\n' +
        '  3. ollama pull llama3.1\n' +
        '  4. ollama serve\n' +
        '  5. ai-gen generate'
      );
    }
    throw error;
  }
}

// Fonctions utilitaires communes
function getSystemPrompt(): string {
  return `Tu es un expert en architecture d'API REST. Ton rôle est d'analyser une description en langage naturel d'une API et de la convertir en une structure JSON détaillée.

La structure doit inclure:
- Le nom du projet (en kebab-case)
- Une description
- Les modules nécessaires avec leurs entités et endpoints
- La configuration d'authentification si mentionnée
- La configuration de base de données si mentionnée

Réponds UNIQUEMENT avec du JSON valide, sans texte additionnel.`;
}

function buildPrompt(description: string): string {
  return `Analyse cette description d'API et génère une structure JSON complète:

"${description}"

La structure JSON doit suivre ce format:
{
  "projectName": "nom-du-projet",
  "description": "Description du projet",
  "modules": [
    {
      "name": "NomModule",
      "description": "Description du module",
      "entities": [
        {
          "name": "NomEntité",
          "properties": [
            {
              "name": "nomPropriété",
              "type": "string|number|boolean|date",
              "required": true,
              "unique": false,
              "description": "Description optionnelle"
            }
          ]
        }
      ],
      "endpoints": [
        {
          "method": "GET|POST|PUT|PATCH|DELETE",
          "path": "/chemin",
          "description": "Description de l'endpoint",
          "authentication": true,
          "responseType": "NomEntité ou NomEntité[]"
        }
      ]
    }
  ],
  "authentication": {
    "type": "jwt|oauth|session",
    "providers": ["local", "google", "etc"]
  },
  "database": {
    "type": "postgres|mysql|mongodb|sqlite",
    "orm": "typeorm|prisma|mongoose"
  }
}

Règles importantes:
1. Déduis automatiquement les modules nécessaires
2. Crée les entités avec toutes leurs propriétés
3. Définis les endpoints CRUD appropriés
4. Si l'authentification est mentionnée, configure-la (JWT par défaut)
5. Utilise PostgreSQL + TypeORM par défaut pour la base de données
6. Assure-toi que tous les endpoints ont des paths cohérents
7. Ajoute des propriétés communes comme id, createdAt, updatedAt aux entités

Génère maintenant la structure JSON:`;
}

function validateAndNormalize(structure: any): APIStructure {
  if (!structure.projectName || !structure.modules || !Array.isArray(structure.modules)) {
    throw new Error('Structure invalide: projectName et modules sont requis');
  }

  const normalized: APIStructure = {
    projectName: structure.projectName,
    description: structure.description || 'API générée automatiquement',
    modules: structure.modules.map((module: any) => ({
      name: module.name,
      description: module.description || '',
      entities: module.entities || [],
      endpoints: module.endpoints || [],
    })),
    authentication: structure.authentication,
    database: structure.database || {
      type: 'postgres',
      orm: 'typeorm',
    },
  };

  return normalized;
}


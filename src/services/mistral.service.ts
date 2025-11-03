import { Mistral } from '@mistralai/mistralai';
import { configManager } from '../config';
import { APIStructure } from '../types';

export class MistralService {
  private client: Mistral;
  private model: string;

  constructor() {
    const apiKey = configManager.getMistralApiKey();
    this.model = configManager.getMistralModel();
    this.client = new Mistral({ apiKey });
  }

  async analyzeDescription(description: string): Promise<APIStructure> {
    const prompt = this.buildPrompt(description);

    try {
      const response = await this.client.chat.complete({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en architecture d'API REST. Ton rôle est d'analyser une description en langage naturel d'une API et de la convertir en une structure JSON détaillée.

La structure doit inclure:
- Le nom du projet (en kebab-case)
- Une description
- Les modules nécessaires avec leurs entités et endpoints
- La configuration d'authentification si mentionnée
- La configuration de base de données si mentionnée

Réponds UNIQUEMENT avec du JSON valide, sans texte additionnel.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        responseFormat: { type: 'json_object' },
      });

      const content = response.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Aucune réponse de Mistral');
      }

      const contentString = typeof content === 'string' ? content : JSON.stringify(content);

      try {
        const parsed = JSON.parse(contentString);
        return this.validateAndNormalize(parsed);
      } catch (error) {
        console.error('Réponse Mistral:', contentString);
        throw new Error('Impossible de parser la réponse de Mistral: ' + error);
      }
    } catch (error: any) {
      if (error.message?.includes('fetch failed')) {
        throw new Error(
          'Impossible de se connecter à l\'API Mistral. Vérifiez:\n' +
          '  1. Votre connexion Internet\n' +
          '  2. Que votre clé API est correcte (ai-gen init)\n' +
          '  3. Consultez TROUBLESHOOTING.md pour plus d\'aide'
        );
      }
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error(
          'Clé API Mistral invalide. Reconfigurez avec: ai-gen init'
        );
      }
      if (error.message?.includes('429') || error.message?.includes('capacity exceeded')) {
        throw new Error(
          '❌ Limite de capacité Mistral dépassée.\n\n' +
          '💡 Solutions:\n' +
          '  1. Attendez quelques minutes et réessayez\n' +
          '  2. Passez à un plan payant Mistral\n' +
          '  3. Utilisez une API alternative GRATUITE:\n' +
          '     - Groq (recommandé, très rapide) - console.groq.com\n' +
          '     - Google Gemini (gratuit) - aistudio.google.com\n' +
          '     - Ollama (local, gratuit) - ollama.com\n\n' +
          '📖 Consultez AI_PROVIDERS.md pour plus d\'options gratuites'
        );
      }
      throw error;
    }
  }

  private buildPrompt(description: string): string {
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
8. Pour les relations entre entités, utilise des propriétés avec le nom de l'entité liée

Génère maintenant la structure JSON:`;
  }

  private validateAndNormalize(structure: any): APIStructure {
    if (!structure.projectName || !structure.modules || !Array.isArray(structure.modules)) {
      throw new Error('Structure invalide: projectName et modules sont requis');
    }

    // Normalisation
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
}


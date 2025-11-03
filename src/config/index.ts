import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export interface Config {
  aiProvider?: 'mistral' | 'groq' | 'gemini' | 'ollama';
  mistralApiKey?: string;
  mistralModel?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  defaultFramework?: string;
  defaultOutput?: string;
}

const CONFIG_DIR = path.join(homedir(), '.ai-boilerplate-generator');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  private config: Config = {};

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        this.config = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement de la configuration:', error);
    }

    // charger depuis les variables d'environnement si disponibles
    if (process.env.MISTRAL_API_KEY) {
      this.config.mistralApiKey = process.env.MISTRAL_API_KEY;
    }
    if (process.env.MISTRAL_MODEL) {
      this.config.mistralModel = process.env.MISTRAL_MODEL;
    }
  }

  public saveConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };

    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2));
  }

  public getConfig(): Config {
    return this.config;
  }

  public getMistralApiKey(): string {
    if (!this.config.mistralApiKey) {
      throw new Error(
        'Clé API Mistral non configurée. Utilisez "ai-gen init" pour la configurer.'
      );
    }
    return this.config.mistralApiKey;
  }

  public getMistralModel(): string {
    return this.config.mistralModel || 'mistral-large-latest';
  }
}

export const configManager = new ConfigManager();


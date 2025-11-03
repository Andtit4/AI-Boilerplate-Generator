import inquirer from 'inquirer';
import chalk from 'chalk';
import { configManager } from '../config';

export async function initConfig() {
  console.log(chalk.blue.bold('\n🚀 Configuration du générateur AI\n'));

  // étape 1: choisir le provider d'IA
  const { aiProvider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'aiProvider',
      message: 'Choisissez votre provider d\'IA:',
      choices: [
        { 
          name: 'Groq (GRATUIT, ultra-rapide, recommandé)', 
          value: 'groq' 
        },
        { 
          name: 'Google Gemini (GRATUIT, 1M tokens/mois)', 
          value: 'gemini' 
        },
        { 
          name: 'Ollama (GRATUIT, local, illimité)', 
          value: 'ollama' 
        },
        { 
          name: 'Mistral (Payant après limite)', 
          value: 'mistral' 
        },
      ],
      default: 'groq',
    },
  ]);

  const config: any = { aiProvider };

  // etape 2: Configuration selon le provider choisi
  if (aiProvider === 'groq') {
    console.log(chalk.cyan('\nObtenez votre clé gratuite: https://console.groq.com/keys\n'));
    
    const groqAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'groqApiKey',
        message: 'Clé API Groq (commence par gsk_):',
        validate: (input: string) => {
          if (!input || input.trim() === '') {
            return 'La clé API Groq est requise';
          }
          if (!input.startsWith('gsk_')) {
            return 'La clé Groq devrait commencer par "gsk_"';
          }
          return true;
        },
      },
    ]);
    Object.assign(config, groqAnswers);
    
  } else if (aiProvider === 'gemini') {
    console.log(chalk.cyan('\nObtenez votre clé gratuite: https://aistudio.google.com/app/apikey\n'));
    
    const geminiAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'geminiApiKey',
        message: 'Clé API Google Gemini:',
        validate: (input: string) => {
          if (!input || input.trim() === '') {
            return 'La clé API Gemini est requise';
          }
          return true;
        },
      },
    ]);
    Object.assign(config, geminiAnswers);
    
  } else if (aiProvider === 'ollama') {
    console.log(chalk.cyan('\nOllama fonctionne en local, pas besoin de clé API!'));
    console.log(chalk.gray('Installation: curl -fsSL https://ollama.com/install.sh | sh'));
    console.log(chalk.gray('Puis: ollama pull llama3.1\n'));
    
    const ollamaAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ollamaReady',
        message: 'Avez-vous installé Ollama et téléchargé un modèle?',
        default: false,
      },
    ]);
    
    if (!ollamaAnswers.ollamaReady) {
      console.log(chalk.yellow('\n Installez Ollama avant de continuer:'));
      console.log(chalk.white('  1. curl -fsSL https://ollama.com/install.sh | sh'));
      console.log(chalk.white('  2. ollama pull llama3.1'));
      console.log(chalk.white('  3. Relancez: ai-gen init\n'));
      return;
    }
    
  } else if (aiProvider === 'mistral') {
    console.log(chalk.cyan('\nObtenez votre clé: https://console.mistral.ai/\n'));
    console.log(chalk.yellow(' Attention: Mistral est payant après les limites gratuites\n'));
    
    const mistralAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'mistralApiKey',
        message: 'Clé API Mistral:',
        validate: (input: string) => {
          if (!input || input.trim() === '') {
            return 'La clé API est requise';
          }
          return true;
        },
      },
      {
        type: 'list',
        name: 'mistralModel',
        message: 'Modèle Mistral à utiliser:',
        choices: [
          { name: 'Mistral Large (recommandé)', value: 'mistral-large-latest' },
          { name: 'Mistral Medium', value: 'mistral-medium-latest' },
          { name: 'Mistral Small', value: 'mistral-small-latest' },
        ],
        default: 'mistral-large-latest',
      },
    ]);
    Object.assign(config, mistralAnswers);
  }

  // étape 3: Configuration commune
  const commonAnswers = await inquirer.prompt([
    {
      type: 'list',
      name: 'defaultFramework',
      message: 'Framework par défaut:',
      choices: [
        { name: 'NestJS (recommandé)', value: 'nestjs' },
        { name: 'Express', value: 'express' },
      ],
      default: 'nestjs',
    },
    {
      type: 'input',
      name: 'defaultOutput',
      message: 'Dossier de sortie par défaut:',
      default: './output',
    },
  ]);

  Object.assign(config, commonAnswers);

  // sauvegarder la configuration
  configManager.saveConfig(config);

  console.log(chalk.green('\n Configuration sauvegardée avec succès!\n'));
  
  // Message personnalisé selon le provider
  if (aiProvider === 'groq') {
    console.log(chalk.cyan(' Groq configuré - Génération ultra-rapide et gratuite!'));
  } else if (aiProvider === 'gemini') {
    console.log(chalk.cyan(' Gemini configuré - 1M tokens gratuits par mois!'));
  } else if (aiProvider === 'ollama') {
    console.log(chalk.cyan(' Ollama configuré - Local et illimité!'));
  } else if (aiProvider === 'mistral') {
    console.log(chalk.cyan(' Mistral configuré'));
  }
  
  console.log(chalk.gray('\nVous pouvez maintenant utiliser: ai-gen generate\n'));
}


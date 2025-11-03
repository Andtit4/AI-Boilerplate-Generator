import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { GenerateOptions } from '../types';
import { createAIProvider } from '../services/ai-provider.factory';
import { GeneratorService } from '../services/generator.service';
import { configManager } from '../config';

export async function generateAPI(options: GenerateOptions) {
  console.log(chalk.blue.bold('\nGénérateur d\'API avec IA\n'));

  let description = options.description;

    // si pas de description fournie, demander à l'utilisateur
  if (!description) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Décrivez l\'API que vous souhaitez générer:',
        validate: (input: string) => {
          if (!input || input.trim() === '') {
            return 'Une description est requise';
          }
          return true;
        },
      },
    ]);
    description = answers.description;
  }

  // récupérer le provider configuré
  const config = configManager.getConfig();
  const providerName = config.aiProvider || 'mistral';
  const providerLabel = providerName === 'groq' ? 'Groq' : 
                        providerName === 'gemini' ? 'Gemini' : 
                        providerName === 'ollama' ? 'Ollama' : 'Mistral';

  const spinner = ora(`Analyse de votre demande avec ${providerLabel} AI...`).start();

  try {
    // étape 1: analyser la demande avec le provider configuré
    const aiProvider = createAIProvider();
    const apiStructure = await aiProvider.analyzeDescription(description!);
    
    spinner.succeed('Analyse terminée!');
    
    // afficher la structure détectée
    console.log(chalk.cyan('\n Structure détectée:'));
    console.log(chalk.gray(`  Projet: ${apiStructure.projectName}`));
    console.log(chalk.gray(`  Modules: ${apiStructure.modules.map(m => m.name).join(', ')}`));
    if (apiStructure.authentication) {
      console.log(chalk.gray(`  Authentification: ${apiStructure.authentication.type}`));
    }
    if (apiStructure.database) {
      console.log(chalk.gray(`  Base de données: ${apiStructure.database.type} avec ${apiStructure.database.orm}`));
    }
    console.log('');

    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Voulez-vous générer cette API?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\n Génération annulée.\n'));
      return;
    }

    // étape 2: générer le code
    const generateSpinner = ora('Génération du projet...').start();
    
    const generatorService = new GeneratorService();
    await generatorService.generateProject(apiStructure, {
      output: options.output,
      framework: options.framework,
      includeDocker: options.docker,
      includeSwagger: options.swagger,
    });

    generateSpinner.succeed('Projet généré avec succès!');

    console.log(chalk.green.bold('\n Génération terminée!\n'));
    console.log(chalk.gray(`dossier de sortie: ${options.output}\n`));
    console.log(chalk.cyan('Pour démarrer:'));
    console.log(chalk.white(`  cd ${options.output}`));
    console.log(chalk.white('  npm install'));
    console.log(chalk.white('  npm run start:dev\n'));

  } catch (error) {
    spinner.fail('Erreur lors de la génération');
    console.error(chalk.red('\n Erreur:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}


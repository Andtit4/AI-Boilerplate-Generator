#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { generateAPI } from './commands/generate';
import { initConfig } from './commands/init';
import { listTemplates } from './commands/list-templates';

const program = new Command();

program
  .name('ai-gen')
  .description('Générateur d\'API modulaire avec IA (Mistral)')
  .version('1.0.0');

program
  .command('generate')
  .alias('g')
  .description('Génère une API à partir d\'une description en langage naturel')
  .option('-d, --description <description>', 'Description de l\'API à générer')
  .option('-o, --output <path>', 'Dossier de sortie', './output')
  .option('-f, --framework <framework>', 'Framework à utiliser (nestjs|express)', 'nestjs')
  .option('--no-docker', 'Ne pas générer la configuration Docker')
  .option('--no-swagger', 'Ne pas générer la documentation Swagger')
  .action(generateAPI);

program
  .command('init')
  .description('Initialise la configuration (API key Mistral, etc.)')
  .action(initConfig);

program
  .command('list-templates')
  .alias('ls')
  .description('Liste les templates disponibles')
  .action(listTemplates);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}


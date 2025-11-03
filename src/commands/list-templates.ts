import chalk from 'chalk';

export function listTemplates() {
  console.log(chalk.blue.bold('\n📋 Templates disponibles:\n'));

  const templates = [
    {
      name: 'NestJS',
      description: 'API REST avec NestJS, TypeORM, Swagger',
      features: ['Modules', 'Services', 'Controllers', 'DTOs', 'Entities'],
    },
    {
      name: 'Express',
      description: 'API REST avec Express, Sequelize',
      features: ['Routes', 'Controllers', 'Models', 'Middlewares'],
    },
  ];

  templates.forEach((template) => {
    console.log(chalk.green(`\n${template.name}`));
    console.log(chalk.gray(`  Description: ${template.description}`));
    console.log(chalk.gray(`  Features: ${template.features.join(', ')}`));
  });

  console.log('\n');
}



import * as fs from 'fs-extra';
import * as path from 'path';
import { APIStructure } from '../types';
import { NestJSGenerator } from '../generators/nestjs.generator';
import { ExpressGenerator } from '../generators/express.generator';
import { DockerGenerator } from '../generators/docker.generator';

export interface GeneratorOptions {
  output: string;
  framework: 'nestjs' | 'express';
  includeDocker: boolean;
  includeSwagger: boolean;
}

export class GeneratorService {
  async generateProject(
    structure: APIStructure,
    options: GeneratorOptions
  ): Promise<void> {
    const outputPath = path.resolve(options.output);

    // dossier de sortie
    await fs.ensureDir(outputPath);

    if (options.framework === 'nestjs') {
      const generator = new NestJSGenerator(structure, options);
      await generator.generate(outputPath);
    } else {
      const generator = new ExpressGenerator(structure, options);
      await generator.generate(outputPath);
    }

    if (options.includeDocker) {
      const dockerGenerator = new DockerGenerator(structure, options);
      await dockerGenerator.generate(outputPath);
    }

    await this.generateReadme(structure, outputPath, options);
  }

  private async generateReadme(
    structure: APIStructure,
    outputPath: string,
    options: GeneratorOptions
  ): Promise<void> {
    const readme = `# ${structure.projectName}

${structure.description}

## Description

Ce projet a été généré automatiquement par AI Boilerplate Generator.

## Modules

${structure.modules.map(m => `- **${m.name}**: ${m.description}`).join('\n')}

## Technologies

- Framework: ${options.framework.toUpperCase()}
- Base de données: ${structure.database?.type || 'PostgreSQL'}
- ORM: ${structure.database?.orm || 'TypeORM'}
${structure.authentication ? `- Authentification: ${structure.authentication.type.toUpperCase()}` : ''}
${options.includeSwagger ? '- Documentation: Swagger/OpenAPI' : ''}
${options.includeDocker ? '- Conteneurisation: Docker' : ''}

## Installation

\`\`\`bash
npm install
\`\`\`

## Configuration

1. Copiez le fichier \`.env.example\` vers \`.env\`
2. Configurez vos variables d'environnement

## Démarrage

### Développement
\`\`\`bash
npm run start:dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm run start:prod
\`\`\`

${options.includeDocker ? `### Avec Docker
\`\`\`bash
docker-compose up -d
\`\`\`
` : ''}

## Documentation

${options.includeSwagger ? 'Une fois l\'application démarrée, la documentation Swagger est disponible à: http://localhost:3000/api' : ''}

## Tests

\`\`\`bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Couverture
npm run test:cov
\`\`\`

## Endpoints

${structure.modules.map(module => `
### ${module.name}

${module.endpoints.map(endpoint => `- **${endpoint.method}** \`${endpoint.path}\` - ${endpoint.description}`).join('\n')}
`).join('\n')}

## Licence

MIT

---

Généré  par AI Boilerplate Generator
`;

    await fs.writeFile(path.join(outputPath, 'README.md'), readme);
  }
}


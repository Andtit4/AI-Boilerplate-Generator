# Guide de Contribution

Merci de votre intérêt pour contribuer à AI Boilerplate Generator ! 🎉

## Comment contribuer

### Signaler des bugs

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/Andtit4/AI-Boilerplate-Generator/issues)
2. Créez une nouvelle issue avec le template "Bug Report"
3. Incluez :
   - Description détaillée du problème
   - Étapes pour reproduire
   - Comportement attendu vs réel
   - Version de Node.js et de l'outil
   - Logs d'erreur si disponibles

### Proposer des fonctionnalités

1. Créez une issue avec le template "Feature Request"
2. Décrivez clairement :
   - Le cas d'usage
   - La solution proposée
   - Des alternatives envisagées

### Soumettre du code

1. **Fork** le projet
2. **Clone** votre fork
   ```bash
   git clone https://github.com/Andtit4/AI-Boilerplate-Generator.git
   cd AI-Boilerplate-Generator
   ```

3. **Créez une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

4. **Installez les dépendances**
   ```bash
   npm install
   ```

5. **Développez** votre fonctionnalité
   - Suivez les conventions de code
   - Ajoutez des tests si applicable
   - Mettez à jour la documentation

6. **Testez** vos changements
   ```bash
   npm run build
   npm run test
   ```

7. **Committez** vos changements
   ```bash
   git add .
   git commit -m "feat: description de votre fonctionnalité"
   ```

   Utilisez les préfixes conventionnels :
   - `feat:` pour une nouvelle fonctionnalité
   - `fix:` pour un correctif
   - `docs:` pour la documentation
   - `refactor:` pour du refactoring
   - `test:` pour les tests
   - `chore:` pour les tâches de maintenance

8. **Poussez** vers votre fork
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

9. **Créez une Pull Request** sur le repository principal

## Standards de code

### TypeScript

- Utilisez TypeScript strict
- Définissez les types explicitement
- Évitez `any` quand possible
- Documentez les fonctions complexes

### Formatage

- 2 espaces pour l'indentation
- Point-virgule obligatoire
- Guillemets simples pour les strings
- Exécutez `npm run format` avant de committer

### Nommage

- **Variables/Fonctions** : camelCase
- **Classes/Interfaces** : PascalCase
- **Constantes** : UPPER_SNAKE_CASE
- **Fichiers** : kebab-case

### Structure

```typescript
// 1. Imports
import { Module } from '@nestjs/common';
import { SomeService } from './some.service';

// 2. Types/Interfaces
export interface Config {
  apiKey: string;
}

// 3. Classes
export class MyClass {
  // Propriétés privées
  private config: Config;

  // Constructeur
  constructor(config: Config) {
    this.config = config;
  }

  // Méthodes publiques
  public async doSomething(): Promise<void> {
    // Implementation
  }

  // Méthodes privées
  private helper(): string {
    return 'helper';
  }
}
```

## Tests

- Ajoutez des tests pour les nouvelles fonctionnalités
- Assurez-vous que tous les tests passent
- Visez une couverture de code élevée

```bash
# Exécuter les tests
npm run test

# Avec couverture
npm run test:cov
```

## Documentation

- Mettez à jour le README.md si nécessaire
- Ajoutez des commentaires JSDoc pour les fonctions publiques
- Incluez des exemples d'utilisation

## Architecture du projet

```
src/
├── cli.ts                 # Point d'entrée CLI
├── commands/              # Commandes du CLI
│   ├── generate.ts
│   ├── init.ts
│   └── list-templates.ts
├── config/                # Gestion de la configuration
│   └── index.ts
├── generators/            # Générateurs de code
│   ├── base.generator.ts
│   ├── nestjs.generator.ts
│   ├── express.generator.ts
│   └── docker.generator.ts
├── services/              # Services métier
│   ├── mistral.service.ts
│   └── generator.service.ts
└── types/                 # Définitions de types
    └── index.ts
```

##  Processus de review

1. Une PR doit avoir au moins 1 approbation
2. Tous les tests doivent passer
3. Le code doit être formaté correctement
4. La documentation doit être à jour

## Idées de contribution

### Fonctionnalités recherchées

- [ ] Support de nouveaux frameworks (Fastify, Koa, etc.)
- [ ] Support de Prisma comme ORM
- [ ] Génération de tests automatiques
- [ ] Support GraphQL
- [ ] Templates personnalisables
- [ ] Mode interactif amélioré
- [ ] Support de MongoDB avec Mongoose
- [ ] Génération de migrations de base de données
- [ ] CI/CD configuration (GitHub Actions, GitLab CI)
- [ ] Support de Kubernetes

### Améliorations

- [ ] Meilleure gestion des erreurs
- [ ] Plus d'exemples dans la documentation
- [ ] Optimisation des prompts Mistral
- [ ] Cache des réponses IA
- [ ] Mode verbose pour le debugging
- [ ] Templates multi-langues

## Questions

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une issue avec le label "question"
- Rejoindre les discussions
- Contacter les mainteneurs

## Remerciements

Merci de contribuer à rendre cet outil meilleur pour tout le monde !

Chaque contribution, petite ou grande, est appréciée. 



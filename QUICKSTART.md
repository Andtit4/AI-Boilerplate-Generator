# Guide de Démarrage Rapide

Ce guide vous permettra de générer votre première API en moins de 5 minutes !

## Prérequis

- Node.js >= 18.0.0 installé
- npm ou yarn
- Une clé API Mistral ([obtenir ici](https://console.mistral.ai/))

## nstallation en 3 étapes

###  Installer l'outil

```bash
# Cloner le repository
git clone <repository-url>
cd ai-boilerplate-generator

# Installer les dépendances
npm install

# Build le projet
npm run build

# Lier globalement (optionnel)
npm link
```

###  Configuration

```bash
# Lancer la configuration interactive
ai-gen init

# OU définir les variables d'environnement
export MISTRAL_API_KEY=your_api_key_here
```

Suivez les instructions pour :
- Entrer votre clé API Mistral
- Choisir le modèle (recommandé: mistral-large-latest)
- Sélectionner le framework par défaut (recommandé: nestjs)

###  Générer votre première API

```bash
ai-gen generate
```

Quand demandé, entrez par exemple :
```
Crée-moi une API de blog avec articles, auteurs et commentaires
```

## ✨ Exemple complet

### Scénario : API de gestion de tâches

```bash
# 1. Générer le projet
ai-gen generate -d "API de gestion de tâches avec projets, tâches, utilisateurs et authentification JWT" -o ./task-manager

# 2. Aller dans le dossier
cd task-manager

# 3. Installer les dépendances
npm install

# 4. Configurer l'environnement
cp .env.example .env

# 5. Modifier .env
nano .env  # ou votre éditeur préféré
```

Exemple de `.env` :
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=task_manager

JWT_SECRET=super-secret-change-this
JWT_EXPIRATION=7d
```

```bash
# 6. Démarrer PostgreSQL avec Docker
docker-compose up -d db

# 7. Démarrer l'application
npm run start:dev
```

### Résultat

L'API est maintenant accessible :
-  API : http://localhost:3000
-  Documentation Swagger : http://localhost:3000/api

##  Tester l'API

### Avec Swagger (Recommandé)

1. Ouvrez http://localhost:3000/api
2. Testez les endpoints directement dans l'interface

### Avec curl

```bash
# S'enregistrer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Se connecter et récupérer le token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Utiliser le token pour créer un projet (remplacez YOUR_TOKEN)
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Mon Premier Projet",
    "description": "Description du projet"
  }'

# Récupérer tous les projets
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Avec Postman

1. Importez la collection générée (si disponible)
2. Configurez l'authentification Bearer Token
3. Testez les endpoints

##  Exemples de descriptions

### Simple
```
API de blog avec articles et auteurs
```

### Moyenne complexité
```
API e-commerce avec produits, catégories, panier et commandes
```

### Complexe
```
API de réseau social avec utilisateurs, posts, commentaires, likes, followers et authentification JWT. Support des images de profil.
```

##  Personnalisation

### Modifier les entités

Les entités générées sont dans `src/[module-name]/entities/`.

Exemple : `src/users/entities/user.entity.ts`

```typescript
// Ajoutez de nouvelles propriétés
@Column({ nullable: true })
phone: string;
```

### Ajouter de la logique métier

Modifiez les services dans `src/[module-name]/*.service.ts`

```typescript
// Exemple: Ajouter une méthode personnalisée
async findByEmail(email: string): Promise<User> {
  return this.userRepository.findOne({ where: { email } });
}
```

### Ajouter des endpoints

Modifiez les controllers dans `src/[module-name]/*.controller.ts`

```typescript
@Get('search')
async search(@Query('q') query: string) {
  return this.service.search(query);
}
```

## 🐳 Déploiement avec Docker

```bash
# Build et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

## Commandes utiles

```bash
# Développement
npm run start:dev          # Démarrer en mode watch

# Production
npm run build             # Compiler
npm run start:prod        # Démarrer en production

# Tests
npm run test             # Tests unitaires
npm run test:e2e         # Tests e2e
npm run test:cov         # Couverture

# Linting
npm run lint             # Vérifier le code
npm run format           # Formater le code
```

## ❓ Problèmes courants

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Redémarrer PostgreSQL
docker-compose restart db

# Vérifier les logs
docker-compose logs db
```

### Port 3000 déjà utilisé

Modifiez le port dans `.env` :
```env
PORT=3001
```

### Module non trouvé après génération

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

##  Ressources

- [Documentation complète](README.md)
- [Exemples détaillés](EXAMPLES.md)
- [Guide de contribution](CONTRIBUTING.md)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

##  Aide

Besoin d'aide ? 
- Consultez la [documentation complète](README.md)
- Ouvrez une [issue sur GitHub](https://github.com/votre-repo/issues)
- Rejoignez la communauté

## Prochaines étapes

1.  Générez votre première API
2.  Testez les endpoints
3.  Personnalisez selon vos besoins
4.  Ajoutez votre logique métier
5.  Déployez en production !

---

**Bon développement !**


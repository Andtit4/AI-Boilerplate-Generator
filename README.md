# 🤖 AI Boilerplate Generator

Générateur d'API modulaire avec Intelligence Artificielle (Mistral AI).

## 📖 Description

AI Boilerplate Generator est un outil en ligne de commande qui utilise l'IA pour générer automatiquement des API REST complètes à partir d'une simple description en langage naturel.

**Exemple :**
```
Crée-moi une API de gestion de commandes avec utilisateurs, produits et authentification JWT.
```

Et l'outil génère automatiquement :
- ✅ Structure complète du projet (NestJS ou Express)
- ✅ Modules, services et controllers
- ✅ Entités et DTOs avec validation
- ✅ Configuration Docker et docker-compose
- ✅ Documentation Swagger/OpenAPI
- ✅ Authentification JWT
- ✅ Configuration de base de données (TypeORM)

## 🚀 Installation

### Prérequis

- Node.js >= 18.0.0
- npm ou yarn
- Une clé API Mistral ([obtenir une clé](https://console.mistral.ai/))

### Installation globale

```bash
npm install -g ai-boilerplate-generator
```

### Installation locale (développement)

```bash
git clone <repository-url>
cd ai-boilerplate-generator
npm install
npm run build
npm link
```

## ⚙️ Configuration

Avant d'utiliser l'outil, configurez votre clé API Mistral :

```bash
ai-gen init
```

Cette commande vous guidera à travers la configuration :
- Clé API Mistral
- Modèle Mistral à utiliser (Large, Medium, Small)
- Framework par défaut (NestJS ou Express)
- Dossier de sortie par défaut

Alternativement, vous pouvez définir des variables d'environnement :

```bash
export MISTRAL_API_KEY=your_api_key_here
export MISTRAL_MODEL=mistral-large-latest
```

## 🎯 Utilisation

### Génération interactive

```bash
ai-gen generate
```

Vous serez invité à décrire votre API. Exemples de descriptions :

- "API de blog avec articles, auteurs et commentaires"
- "API e-commerce avec produits, panier et paiements"
- "API de gestion de tâches avec utilisateurs et projets"
- "API de réservation d'hôtel avec chambres et clients"

### Génération directe

```bash
ai-gen generate -d "API de gestion de bibliothèque avec livres, auteurs et emprunts"
```

### Options avancées

```bash
ai-gen generate \
  -d "Description de votre API" \
  -o ./mon-projet \
  -f nestjs \
  --no-docker \
  --no-swagger
```

**Options disponibles :**
- `-d, --description <description>` : Description de l'API
- `-o, --output <path>` : Dossier de sortie (défaut: `./output`)
- `-f, --framework <framework>` : Framework (nestjs|express, défaut: `nestjs`)
- `--no-docker` : Ne pas générer la configuration Docker
- `--no-swagger` : Ne pas générer la documentation Swagger

### Autres commandes

```bash
# Lister les templates disponibles
ai-gen list-templates
# ou
ai-gen ls

# Afficher l'aide
ai-gen --help
```

## 📦 Structure générée (NestJS)

```
mon-projet/
├── src/
│   ├── auth/                    # Module d'authentification (si JWT)
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                   # Module exemple
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Démarrer le projet généré

```bash
# Aller dans le dossier du projet
cd output

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos configurations

# Démarrer en mode développement
npm run start:dev

# Ou avec Docker
docker-compose up -d
```

L'API sera accessible à `http://localhost:3000`

La documentation Swagger sera disponible à `http://localhost:3000/api`

## 🎨 Fonctionnalités

### ✨ Génération intelligente

L'IA analyse votre description et :
- Identifie les entités nécessaires
- Crée les relations entre entités
- Génère des propriétés pertinentes
- Définit les endpoints CRUD appropriés
- Configure l'authentification si mentionnée
- Choisit la base de données adaptée

### 🏗️ Architecture moderne

- **NestJS** : Framework TypeScript moderne et modulaire
- **TypeORM** : ORM puissant pour TypeScript
- **Class Validator** : Validation automatique des données
- **Swagger** : Documentation API interactive
- **JWT** : Authentification sécurisée
- **Docker** : Conteneurisation prête pour la production

### 🔒 Sécurité

- Validation des entrées avec class-validator
- Hashing des mots de passe avec bcrypt
- Authentification JWT
- Guards et stratégies Passport

### 📝 Documentation automatique

- README complet avec instructions
- Documentation Swagger/OpenAPI
- Exemples d'endpoints
- Guide de démarrage

## 🌟 Exemples

### API de blog

```bash
ai-gen generate -d "API de blog avec articles, catégories, auteurs et commentaires. Les utilisateurs peuvent s'authentifier avec JWT."
```

Génère :
- Module Articles (CRUD complet)
- Module Catégories
- Module Auteurs
- Module Commentaires
- Module Auth avec JWT
- Relations entre entités
- Endpoints protégés

### API e-commerce

```bash
ai-gen generate -d "API e-commerce avec produits, catégories, panier, commandes et paiements. Authentification requise pour les commandes."
```

Génère :
- Module Produits
- Module Catégories
- Module Panier
- Module Commandes
- Module Paiements
- Module Auth
- Base de données PostgreSQL

### API de gestion

```bash
ai-gen generate -d "API de gestion de projet avec projets, tâches, utilisateurs et équipes. Support de PostgreSQL."
```

Génère :
- Module Projets
- Module Tâches
- Module Utilisateurs
- Module Équipes
- Configuration PostgreSQL + TypeORM

## 🔧 Configuration avancée

### Modifier le modèle Mistral

Le fichier de configuration se trouve dans `~/.ai-boilerplate-generator/config.json` :

```json
{
  "mistralApiKey": "your-api-key",
  "mistralModel": "mistral-large-latest",
  "defaultFramework": "nestjs",
  "defaultOutput": "./output"
}
```

Modèles disponibles :
- `mistral-large-latest` (recommandé) : Meilleure qualité
- `mistral-medium-latest` : Bon compromis
- `mistral-small-latest` : Plus rapide, moins coûteux

### Personnaliser les templates

Les templates se trouvent dans `src/generators/`. Vous pouvez les modifier selon vos besoins.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des fonctionnalités
- Améliorer la documentation
- Soumettre des pull requests

## 📄 Licence

MIT

## 🙏 Remerciements

- [Mistral AI](https://mistral.ai/) pour leur API puissante
- [NestJS](https://nestjs.com/) pour le framework
- La communauté open source

---

**Développé avec ❤️ et ✨ IA**

Pour toute question ou support, ouvrez une issue sur GitHub.



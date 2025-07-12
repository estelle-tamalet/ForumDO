# Forum Angular avec PocketBase

Ce projet est un forum développé avec Angular 20 et PocketBase comme backend. Il permet aux utilisateurs de créer des cours, des sujets de discussion et des posts.

## Prérequis

- Node.js (version 18 ou supérieure)
- Angular CLI (`npm install -g @angular/cli`)
- PocketBase (téléchargeable depuis [pocketbase.io](https://pocketbase.io/))

## Installation

1. Clonez le projet :
```bash
git clone https://github.com/estelle-tamalet/ForumDO.git
cd forum
```

2. Installez les dépendances :
```bash
npm install
```

3. Téléchargez PocketBase et placez l'exécutable dans un dossier `pocketbase/` à la racine du projet.

## Configuration de PocketBase

### 1. Démarrage de PocketBase

Lancez PocketBase avec la commande suivante :
```bash
./pocketbase/pocketbase serve
```

PocketBase sera accessible sur `http://127.0.0.1:8090` et l'interface d'administration sur `http://127.0.0.1:8090/_/`

### 2. Configuration des Collections

**Option A : Configuration manuelle**

Créez les collections suivantes dans l'interface d'administration PocketBase :

#### Collection `users` (utilisateurs)
- **Type** : Auth collection
- **Champs par défaut** : email, password, name, etc.
- **Règles API** :
  - List/Search : `id = @request.auth.id`
  - View : `id = @request.auth.id`
  - Update : ``id = @request.auth.id``
  - Delete : ``id = @request.auth.id``

#### Collection `cours` (cours)
- **Champs** :
  - `title` (text, required) - Titre du cours
  - `auteur` (relation vers users, required) - Auteur du cours
- **Règles API** :
  - List/Search : `@request.auth.id != ""`
  - Create : `@request.auth.id != ""`
  - Update : `@request.auth.id = auteur.id`
  - Delete : `@request.auth.id = auteur.id`

#### Collection `sujets` (sujets de discussion)
- **Champs** :
  - `titre` (text, required) - Titre du sujet
  - `cours` (relation vers cours, required) - Cours parent
  - `auteur` (relation vers users, required) - Auteur du sujet
- **Règles API** :
  - List/Search : `@request.auth.id != ""`
  - Create : `@request.auth.id != ""`
  - Update : `@request.auth.id = auteur.id`
  - Delete : `@request.auth.id = auteur.id`

#### Collection `posts` (messages)
- **Champs** :
  - `contenu` (text, required) - Contenu du message
  - `sujet` (relation vers sujets, required) - Sujet parent
  - `auteur` (relation vers users, required) - Auteur du message
- **Règles API** :
  - List/Search : `@request.auth.id != ""`
  - Create : `@request.auth.id != ""`
  - Update : `@request.auth.id = auteur.id`
  - Delete : `@request.auth.id = auteur.id`


**Option B : Import automatique avec pb.json**

Un fichier `pb.json` est fourni avec le projet, vous pouvez donc importer automatiquement toutes les collections et leurs règles :

1. Arrêtez PocketBase s'il est en cours d'exécution
2. Copiez le fichier `pb.json` dans le dossier `pocketbase/pb_data/`
3. Relancez PocketBase avec `./pocketbase/pocketbase serve`
4. Les collections seront automatiquement créées avec leurs règles

## Structure du Projet

```
src/
├── app/
│   ├── auth/
│   │   └── login/          # Composant de connexion
│   ├── cours/              # Composant de gestion des cours
│   ├── sujets/             # Composant de gestion des sujets
│   ├── posts/              # Composant de gestion des posts
│   └── services/
│       └── pocketbase.service.ts  # Service de communication avec PocketBase
```

## Fonctionnalités

### Authentification
- Connexion avec email/mot de passe via PocketBase
- Token stocké en localStorage
- Vérification d'autorisation pour les actions CRUD

### Gestion des Cours
- Création, modification et suppression de cours
- Seul l'auteur peut modifier/supprimer ses cours
- Pagination disponible

### Gestion des Sujets
- Création de sujets dans un cours spécifique
- Modification et suppression par l'auteur uniquement
- Affichage avec informations de l'auteur (expand)

### Gestion des Posts
- Création de messages dans un sujet
- Modification et suppression par l'auteur uniquement
- Pagination et tri chronologique

## Démarrage du Projet

1. **Démarrez PocketBase** :
```bash
./pocketbase/pocketbase serve
```

2. **Démarrez l'application Angular** :
```bash
ng serve
```

L'application sera accessible sur `http://localhost:4200`

## API PocketBase

Le service PocketBase (`pocketbase.service.ts`) fournit les méthodes suivantes :

### Authentification
- `login(email, password)` : Connexion utilisateur
- `setAuth(token, userId)` : Gestion du token d'authentification

### CRUD Cours
- `createCours(title)` : Créer un cours
- `updateCours(id, title)` : Modifier un cours
- `deleteCours(id)` : Supprimer un cours
- `getCoursWithPagination(page, perPage)` : Lister les cours avec pagination

### CRUD Sujets
- `createSujet(title, coursId)` : Créer un sujet
- `updateSujet(id, title)` : Modifier un sujet
- `deleteSujet(id)` : Supprimer un sujet
- `getSujetsByCours(coursId)` : Lister les sujets d'un cours
- `getSujetsWithPagination(coursId, page, perPage)` : Pagination des sujets

### CRUD Posts
- `createPost(content, sujetId)` : Créer un post
- `updatePost(id, content)` : Modifier un post
- `deletePost(id)` : Supprimer un post
- `getPostsBySujet(sujetId)` : Lister les posts d'un sujet
- `getPostsWithPagination(sujetId, page, perPage)` : Pagination des posts

### Utilitaires
- `isOwner(itemAuthorId)` : Vérifier si l'utilisateur est propriétaire d'un élément

## Sécurité

- Authentification obligatoire pour toutes les opérations
- Contrôle d'autorisation basé sur l'auteur pour les modifications/suppressions
- Token JWT géré automatiquement par le service
- Règles API PocketBase pour la sécurité côté serveur

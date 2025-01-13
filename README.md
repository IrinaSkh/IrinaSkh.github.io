# 🎵 Web Audio Player - Lecteur Audio Modulaire avec Web Components 🎵

## Description du Projet
Ce projet est un **lecteur audio web modulaire** basé sur les **Web Components**, conçu dans le cadre de mon Master 2 MIAGE NumRes. Il exploite des technologies modernes comme **HTML5**, **JavaScript (ES6)** et la **Web Audio API**, tout en adoptant un look rétro. 

Une des idées originales du projet est l'intégration du **Butterchurn Visualizer** en tant qu'arrière-plan dynamique, ajoutant une touche immersive et esthétique à l'expérience utilisateur.

---

## Fonctionnalités
### 🎧 Fonctionnalités principales
- **Lecture audio complète** : lecture, pause, avance/retour rapide, contrôle du volume et navigation fluide entre les pistes.
- **Gestion intuitive de la playlist** : visualisation des pistes avec glisser-déposer pour réorganiser facilement.
- **Visualisations audio dynamiques** :
  - Oscilloscope interactif (formes d'onde et spectre).
  - **Butterchurn Visualizer** utilisé comme arrière-plan réactif au son.
- **Effets audio personnalisés** :
  - Égaliseur pour ajuster les bandes de fréquences.
  - Réverbération pour ajouter de la profondeur sonore.
  - Panoramique stéréo pour équilibrer les canaux audio.
- **Modularité et extensibilité** grâce à l'intégration de plugins via la Web Audio Modules API (WAM).

---

## Structure du Projet
Le projet est organisé autour de composants autonomes et réutilisables, chacun encapsulé via le **Shadow DOM**. Voici un aperçu des principaux composants :

### 🛠️ Composants techniques
- **`player-component`** : Le cœur du projet. Orchestration de tous les composants et gestion des connexions audio.
- **`playlist-component` et `playlist-dragDrop-component`** : Chargement, navigation et réorganisation intuitive des pistes avec glisser-déposer.
- **`visualizer-component`** : Visualisation de formes d'onde et spectres audio en temps réel.
- **`butterchurn-visualizer-component`** : Visualisation avancée avec animations immersives grâce à Butterchurn.
- **`audio-processor-component`** : Regroupe plusieurs outils de traitement audio :
  - **`equalizer-component`** : Ajustement des bandes de fréquences.
  - **`stereo-component`** : Gestion du panoramique sonore.
  - **`my-reverb`** : Ajout de réverbération via des réponses impulsionnelles.
- **`effects-component`** : Intégration de plugins audio via la Web Audio Modules API.

---

## Défis Rencontrés
1. **Gestion des connexions audio** :  
   - Problème : Déconnexion perturbante lors de l'activation/désactivation d'effets.  
   - Solution : Introduction d'une liste centralisée des nœuds connectés pour reconnecter dynamiquement les composants.

2. **Réverbération** :  
   - Garantir son bon fonctionnement sans perturber les autres effets audio.  
   - Optimisation des connexions pour un rendu sonore fluide.

3. **Butterchurn Visualizer** :  
   - Synchronisation parfaite avec le flux audio.  
   - Gestion des performances pour éviter les ralentissements.

4. **Communication entre composants** :  
   - Mise en place d'événements personnalisés pour coordonner les composants encapsulés.

---

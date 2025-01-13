import '../effects-component/index.js'; // Importation de l'EffectComponent
import '../equalizer-component/index.js'; // Importation de l'EqualizerComponent
import '../audio-component/index.js'
const getBaseURL = () => {
    return new URL('.', import.meta.url);
};
const getBaseRacineURL = () => {
    return new URL('../../', import.meta.url);
};
const templateAudioProcessor = document.createElement('template');
templateAudioProcessor.innerHTML = /*html*/`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #222;
    color: #fff;
    font-family: Arial, sans-serif;
    padding: 20px; /* Espacement interne global */
    box-sizing: border-box; /* Inclut les bordures et padding dans les dimensions */
    border-radius: 8px;
    overflow: hidden; /* Évite tout dépassement des éléments enfants */
  }

  .audio-processor-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Les composants commencent en haut */
    height: 100%; /* Utilise toute la hauteur disponible */
    box-sizing: border-box; /* Assure que les marges/paddings n'affectent pas les dimensions */
    gap: 20px; /* Espacement entre les sections */
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
    flex-shrink: 0; /* Garde la taille de l'en-tête fixe */
  }

  /* Grid layout for main components */
  .processor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Deux colonnes égales */
    gap: 20px; /* Espacement entre les colonnes et les lignes */
    flex-grow: 1; /* Prend l'espace restant disponible */
    height: calc(100% - 60px); /* Ajuste la hauteur en fonction des autres éléments */
    box-sizing: border-box; /* Inclut les marges dans les dimensions */
  }

  .processor-grid > .grid-item {
    display: flex;
    flex-direction: column;
    justify-content: center; /* Centrer les enfants verticalement */
    align-items: center; /* Centrer les enfants horizontalement */
    background-color: #333;
    border-radius: 8px;
    padding: 15px; /* Espacement interne */
    box-sizing: border-box; /* Assure que le padding est inclus dans la taille */
    overflow: hidden; /* Évite les dépassements */
  }

  .grid-item > * {
    width: 100%; /* Les éléments enfants prennent toute la largeur disponible */
    height: 100%; /* Les éléments enfants prennent toute la hauteur disponible */
    max-height: 100%; /* Empêche les débordements */
    max-width: 100%;
  }

  /* Equalizer section */
  .equalizer-section {
    background-color: #333;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    flex-shrink: 0; /* Fixe la taille de l'égaliseur */
    height: auto; /* Ajuste automatiquement la hauteur selon le contenu */
    box-sizing: border-box;
    overflow: hidden; /* Évite les dépassements visuels */
  }

  equalizer-component {
    width: 100%; /* Prend toute la largeur de son conteneur parent */
    height: 100%; /* Prend toute la hauteur de son conteneur parent */
  }

  /* Ajout d'un style pour éviter tout dépassement global */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box; /* Consistance dans la gestion des dimensions */
  }
</style>

<div class="audio-processor-container">
  <div class="section-title">Audio Processor</div>

  <!-- Grid for main components -->
  <div class="processor-grid">
    <!-- Column 1: Effect Component -->
    <div class="grid-item">
      <effect-component id="effectComponent"></effect-component>
    </div>

    <!-- Column 2: Reverb (top row) and Stereo (bottom row) -->
    <div class="grid-item">
      <div>
        <my-reverb id="reverbComponent"></my-reverb>
      </div>
      <div>
        <my-stereo id="stereoComponent"></my-stereo>
      </div>
    </div>
  </div>

  <!-- Equalizer at the bottom -->
  <div class="equalizer-section">
    <equalizer-component id="equalizerComponent"></equalizer-component>
  </div>
</div>

`;

class AudioProcessorComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(templateAudioProcessor.content.cloneNode(true));

        this.audioContext = null;
        this.audioSourceNode = null;
    }

    connectedCallback() {
        this.getElements();
        this.initializeAudioContext();
    }

    getElements() {
        this.reverbComponent = this.shadowRoot.getElementById('reverbComponent');
        this.effectComponent = this.shadowRoot.getElementById('effectComponent');
        this.equalizerComponent = this.shadowRoot.getElementById('equalizerComponent');
        this.stereoComponent = this.shadowRoot.getElementById('stereoComponent');
    }

    initializeAudioContext() {
        this.setAudioContext
    }



    connectChildComponents() {
        //Pass the AudioContext and AudioSourceNode to child components
        if (this.reverbComponent) {
            this.reverbComponent.setupAudioContext(this.audioContext);
            this.reverbComponent.connectAudioSource(this.audioSourceNode);
        }

        if (this.effectComponent) {
            this.effectComponent.setAudioContext(this.audioContext, this.audioSourceNode);

        }

        if (this.equalizerComponent) {
            this.equalizerComponent.connectAudio(this.audioContext, this.audioSourceNode);
    
        }
        if (this.stereoComponent) {
            this.stereoComponent.setupAudioContext(this.audioContext);
            this.stereoComponent.connectAudioSource(this.audioSourceNode);

        }

        console.log('Audio context and source node connected to child components.');
    }

    // Method to provide the audio context and source node externally (optional)
    setAudioContext(audioContext, audioSourceNode) {
        this.audioContext = audioContext;
        this.audioSourceNode = audioSourceNode;

        // Reconnect child components with the new context and source
        this.connectChildComponents();
    }
}

customElements.define('audio-processor', AudioProcessorComponent);

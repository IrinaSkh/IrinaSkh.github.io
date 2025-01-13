
const templateButterchurn = document.createElement('template');
templateButterchurn.innerHTML = /*html*/ `
  <style>
  :host {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  

    overflow: hidden;
  }
  
  canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  </style>
  
  <canvas id="visualizer"></canvas>
`;

class ButterchurnVisualizer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(templateButterchurn.content.cloneNode(true));

    this.canvas = this.shadowRoot.getElementById('visualizer');

    this.visualizer = null;
    this.animationFrameId = null;

    // Propriétés audio
    this.audioContext = null;
    this.analyserNode = null;
    this.audioSourceNode = null;




  }

  connectedCallback() {
    //Écoute de l'événement émis par le composant MyPlayer
    window.addEventListener('audioContextInitialized', this.handleAudioContextInitialized.bind(this));

    if (this.audioContext && this.analyserNode) {
      this.initVisualizer();
    } else {
      console.warn('ButterchurnVisualizer : AudioContext ou AnalyserNode non fourni.');
    }
    console.log("ButterchurnVisualizer connected");
  

  }

  disconnectedCallback() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('audioContextInitialized', this.handleAudioContextInitialized);
  }

  /**
   * Méthode pour recevoir l'AudioContext et l'AnalyserNode depuis le parent
   */
  setAudioContext(audioContext, audioSourceNode, analyserNode) {
    this.audioContext = audioContext;
    this.audioSourceNode = audioSourceNode;
    this.analyserNode = analyserNode;

    if (this.isConnected) {
      this.initVisualizer();
    }
  }


  handleAudioContextInitialized(event) {
    // Récupère les données audio de l'événement
    const { audioContext, audioSourceNode, analyserNode } = event.detail;

    // Définit le contexte audio et initialise le visualiseur
    this.setAudioContext(audioContext, audioSourceNode, analyserNode);
}

  /**
   * Initialiser Butterchurn et démarrer le rendu
   */
  initVisualizer() {

    // Vérifiez que butterchurn.default existe
    if (!this.canvas || !this.analyserNode) return;

    // Crée l'instance Butterchurn
    this.visualizer = butterchurn.createVisualizer(this.audioContext, this.canvas, {
        width: 800,
        height: 600
      });
    // Charger les presets Butterchurn
    const presets = butterchurnPresets.getPresets();
    const randomPreset = presets[Object.keys(presets)[Math.floor(Math.random() * Object.keys(presets).length)]];

    // Charger un preset aléatoire
    this.visualizer.loadPreset(randomPreset, 2.0);

    // Ajouter des contrôles dynamiques
    this.visualizer.setRendererSize(this.canvas.clientWidth, this.canvas.clientHeight);

    // Lancer l'animation
    this.animate();
  }

  /**
   * Méthode d'animation pour synchroniser les visuels avec la musique
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Récupérer les données d'analyse audio
    const audioData = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(audioData);

    // Mettre à jour Butterchurn avec les données audio
    this.visualizer.render(audioData);

  }
}

customElements.define('butterchurn-visualizer', ButterchurnVisualizer);

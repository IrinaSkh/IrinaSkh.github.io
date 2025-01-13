

import '../playlist-component/index.js';
import '../visualizer-component/index.js'
import '../butterchurn-vizualiser-component/index.js'
import '../stereo-component/index.js'
import '../audio-processor-component/index.js'
// // Enregistrement du Web Component
// customElements.define('my-player', MyPlayer);
// Création du template, ajouté au shadow DOM
const template = document.createElement('template');
const html = './player.html';

// Création de la base URL, avec import.meta.url pour calculer des chemins relatifs vers d'autres fichiers
const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

// Fonction pour charger le HTML en texte brut
async function loadHTML(htmlRelativeUrl, baseUrl) {
    const response = await fetch(new URL(htmlRelativeUrl, baseUrl));
    return response.text();
}

// Chargement du HTML et injection dans le template
const templateHTML = await loadHTML(html, getBaseURL());
template.innerHTML = `
    <link rel="stylesheet" href="${getBaseURL() + 'player.css'}">
    <script src="${getBaseURL() + 'html2canvas.js'}"></script>
` + templateHTML;

// Classe de base du Web Component
class MyPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Élément audio et playlist
        //this.audioElement = null;
        this.playlistComponent = null;
        this.freqVisualizerComponent=null;
        this.audioProcessorComponent=null;
        //this.reverb=null;
       // this.balanceComponent = null;

        //this.audioElement = null;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioSourceNode = null; // Sera initialisé une fois
        this.analyserNode = null;
        this.connectedNodes = []; // Liste des nœuds connectés
    }

    async connectedCallback() {
        // Charge le contenu HTML et initialise les références
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.initializeIcons();
        await this.loadPlayerContent();
        this.initEventListeners();


    }

    async loadPlayerContent() {
        // Récupère les éléments <audio> et <playlist-component> après l'ajout du contenu HTML
        this.audioElement = this.shadowRoot.querySelector('audio');
        this.playlistComponent = this.shadowRoot.querySelector('playlist-component');
        this.freqVisualizerComponent = this.shadowRoot.querySelector('oscilloscope-component');
        this.audioProcessorComponent = this.shadowRoot.querySelector('audio-processor');
        //this.reverb=this.shadowRoot.querySelector('my-reverb');

        this.stopButton = this.shadowRoot.getElementById('stop');
        this.rewindButton = this.shadowRoot.getElementById('rewind');
        this.forwardButton = this.shadowRoot.getElementById('forward');
        this.volumeControl = this.shadowRoot.getElementById('volume');
        this.progressBar = this.shadowRoot.getElementById('progressBar');
        this.currentTimeDisplay = this.shadowRoot.getElementById('currentTime');
        this.durationDisplay = this.shadowRoot.getElementById('duration');
        this.next = this.shadowRoot.getElementById('next');
        this.previous = this.shadowRoot.getElementById('previous');
        //this.balanceComponent = this.shadowRoot.querySelector("my-stereo");
        //console.log(this.balanceComponent)

        this.initAudioNodes(); // Initialise le MediaElementSourceNode

        const jsonFileUrl = new URL('track.json', getBaseURL());

        this.playlistComponent.setAttribute('json-url', jsonFileUrl);

        this.freqVisualizerComponent.setAudioContext(this.audioContext, this.audioSourceNode, this.analyserNode);
        this.audioProcessorComponent.setAudioContext(this.audioContext, this.audioSourceNode);

        console.log('on est dans loadplayercontent')
        // Émettre l'événement pour que d'autres composants puissent récupérer l'AudioContext
        this.dispatchEvent(new CustomEvent('audioContextInitialized', {
            detail: {
                audioContext: this.audioContext,
                audioSourceNode: this.audioSourceNode,
                analyserNode: this.analyserNode,
            },
            bubbles: true, // Permet à l'événement de traverser le DOM
            composed: true, // Permet à l'événement de traverser le shadow DOM
        }));

        console.log('Événement audioContextInitialized émis.');

    }

    initAudioNodes() {
        if (!this.audioSourceNode) {
            this.audioSourceNode = this.audioContext.createMediaElementSource(this.audioElement);
        }

        if (!this.analyserNode) {
            // Crée un AnalyserNode dans le même AudioContext
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 256;

            // Connecte l'AudioSourceNode au AnalyserNode, puis à la destination
            this.audioSourceNode.connect(this.analyserNode);
            this.analyserNode.connect(this.audioContext.destination);

            // Ajoutez les nœuds connectés à la liste
            this.updateConnectedNodes();
        }
    }

    initEventListeners() {
        this.playlistComponent.addEventListener("trackSelected", (event) => {
            const { track } = event.detail;
            this.playTrack(track);
        });
        this.stopButton.addEventListener('click', () => this.stopAudio());
        this.rewindButton.addEventListener('click', () => this.rewindAudio());
        this.forwardButton.addEventListener('click', () => this.forwardAudio());
        this.volumeControl.addEventListener('input', (e) => this.changeVolume(e));
        this.progressBar.addEventListener('input', (e) => this.seekAudio(e));

        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.next.addEventListener('click', () => {
            this.playlistComponent.nextTrack();
        });
        this.previous.addEventListener('click', () => {
            this.playlistComponent.previousTrack();
        });

    }


    async playTrack(track) {

        if (!this.audioContext) {
            console.log("le contexte n'est pas défini")
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }
        console.log(track)
        this.audioElement.src = track.url;
        // Gestion des erreurs de chargement
        this.audioElement.onerror = () => {
            console.error(`Erreur de chargement du fichier audio : ${track.url}`);
            alert("La piste sélectionnée est introuvable.");
        };
        this.audioContext.resume();

    
        // this.audioElement.play().catch(error => {
        //     console.error("Erreur lors de la lecture du fichier audio :", error);
        // });
    }
    

    disconnectedCallback() {
        // Nettoyage des événements lorsque le composant est retiré du DOM
        if (this.playlistComponent) {
            this.playlistComponent.removeEventListener("trackSelected", this.playTrack);
        }
    }

        /**
     * Ajouter un nœud à la liste des nœuds connectés
     */
        addNodeToList(node) {
            if (node && !this.connectedNodes.includes(node)) {
                this.connectedNodes.push(node);
            }
        }
    
        /**
         * Mettre à jour la liste des nœuds connectés
         */
        updateConnectedNodes() {
            // Ajoutez ici les nœuds que vous connectez manuellement
            this.addNodeToList(this.audioSourceNode);
            console.log('Liste des nœuds connectés mise à jour :', this.connectedNodes);
        }
    
        /**
         * Expose les nœuds connectés pour d'autres composants (comme la réverbération)
         */
        getConnectedNodes() {
            return this.connectedNodes;
        }
    
        /**
         * Connecter un nouveau nœud au graphe audio
         * @param {AudioNode} node Le nœud audio à connecter
         */
        connectNode(node) {
            if (!this.audioSourceNode || !this.audioContext) {
                console.error('Impossible de connecter le nœud : audioSourceNode ou audioContext non initialisé.');
                return;
            }
    
            this.audioSourceNode.connect(node);
            node.connect(this.audioContext.destination);
    
            this.addNodeToList(node);
            console.log('Nœud connecté et ajouté à la liste :', node);
        }
    
        /**
         * Déconnecter tous les nœuds sauf certains
         * @param {Array<AudioNode>} nodesToKeep Les nœuds à ne pas déconnecter
         */
        disconnectAllExcept(nodesToKeep = []) {
            console.log('Déconnexion de tous les nœuds sauf ceux à conserver.');
    
            this.connectedNodes.forEach((node) => {
                if (!nodesToKeep.includes(node)) {
                    this.audioSourceNode.disconnect(node);
                    console.log('Nœud déconnecté :', node);
                }
            });
        }



    stopAudio() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        //this.playPauseButton.textContent = 'Play';
    }

    rewindAudio() {
        this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - 10);
    }

    forwardAudio() {
        this.audioElement.currentTime = Math.min(this.audioElement.duration, this.audioElement.currentTime + 10);
    }

    changeVolume(event) {
        this.audioElement.volume = parseFloat(event.target.value);
    }

    updateProgress() {
        const currentTime = this.audioElement.currentTime;
        const duration = this.audioElement.duration;
        this.progressBar.value = (currentTime / duration) * 100;
        this.currentTimeDisplay.textContent = this.formatTime(currentTime);
    }

    updateDuration() {
        const duration = this.audioElement.duration;
        this.durationDisplay.textContent = this.formatTime(duration);
    }

    seekAudio(event) {
        const progress = parseFloat(event.target.value);
        this.audioElement.currentTime = (progress / 100) * this.audioElement.duration;
    }

    // loadTrack(url) {
    //     this.audioElement.src = url;
    //     this.audioElement.play();
    //     this.playPauseButton.textContent = 'Pause';
    // }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    drawPlayIcon(ctx) {
        ctx.fillStyle = "#00FF00"; // Vert
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(30, 20);
        ctx.lineTo(10, 30);
        ctx.closePath();
        ctx.fill();
    }

    drawStopIcon(ctx) {
        ctx.fillStyle = "#FF0000"; // Rouge
        ctx.fillRect(10, 10, 20, 20);
    }

    drawRewindIcon(ctx) {
        ctx.fillStyle = "#FFFF00"; // Jaune
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(15, 20);
        ctx.lineTo(30, 30);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(5, 20);
        ctx.lineTo(20, 30);
        ctx.closePath();
        ctx.fill();
    }

    drawForwardIcon(ctx) {
        ctx.fillStyle = "#00FFFF"; // Cyan
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(25, 20);
        ctx.lineTo(10, 30);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(35, 20);
        ctx.lineTo(20, 30);
        ctx.closePath();
        ctx.fill();
    }

    drawVolumeIcon(ctx) {
        ctx.fillStyle = "#FFFFFF"; // Blanc
        ctx.fillRect(10, 15, 5, 10); // Rectangle du haut-parleur

        ctx.beginPath();
        ctx.arc(20, 20, 5, -Math.PI / 2, Math.PI / 2, false); // Cercle représentant le son
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    togglePlay() {
        if (this.audioElement.paused) {
            this.audioElement.play();
        } else {
            this.audioElement.pause();
        }
    }

    stopAudio() {
        this.audioElement.pause();
        this.audioElement.currentTime = 0; // Revenir au début
    }

    rewindAudio() {
        this.audioElement.currentTime = Math.max(0, this.audioElement.currentTime - 10);
    }

    forwardAudio() {
        this.audioElement.currentTime = Math.min(this.audioElement.duration, this.audioElement.currentTime + 10);
    }

    toggleMute() {
        this.audioElement.muted = !this.audioElement.muted;
    }

    initializeIcons() {
        const playCanvas = this.shadowRoot.querySelector('#playIcon');
        const stopCanvas = this.shadowRoot.querySelector('#stopIcon');
        const rewindCanvas = this.shadowRoot.querySelector('#rewindIcon');
        const forwardCanvas = this.shadowRoot.querySelector('#forwardIcon');
        const volumeCanvas = this.shadowRoot.querySelector('#volumeIcon');

        // Vérifiez si les canvases existent
        if (!playCanvas || !stopCanvas || !rewindCanvas || !forwardCanvas || !volumeCanvas) {
            console.error("Certains canvases n'ont pas été trouvés !");
            return;
        }

        const playCtx = playCanvas.getContext('2d');
        const stopCtx = stopCanvas.getContext('2d');
        const rewindCtx = rewindCanvas.getContext('2d');
        const forwardCtx = forwardCanvas.getContext('2d');
        const volumeCtx = volumeCanvas.getContext('2d');

        // Dessiner les icônes
        this.drawPlayIcon(playCtx);
        this.drawStopIcon(stopCtx);
        this.drawRewindIcon(rewindCtx);
        this.drawForwardIcon(forwardCtx);
        this.drawVolumeIcon(volumeCtx);

        // Ajouter les événements
        playCanvas.addEventListener('click', () => this.togglePlay());
        stopCanvas.addEventListener('click', () => this.stopAudio());
        rewindCanvas.addEventListener('click', () => this.rewindAudio());
        forwardCanvas.addEventListener('click', () => this.forwardAudio());
        volumeCanvas.addEventListener('click', () => this.toggleMute());
}
}
// Enregistrement du Web Component
customElements.define('my-player', MyPlayer);

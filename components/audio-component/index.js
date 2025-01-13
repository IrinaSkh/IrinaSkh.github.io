

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};
const getBaseRacineURL = () => {
    return new URL('../../', import.meta.url);
};

const template = document.createElement("template");
template.innerHTML = /*html*/`
    <script src="${getBaseRacineURL()}libs/webaudio-controls.js"></script>
    <style>
        .reverb-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 10px;
            background-color: #333;
            border-radius: 8px;
            color: #fff;
            font-family: Arial, sans-serif;
        }

        .control-group {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
    </style>
    <div class="reverb-container">
        <div class="control-group">
            <span>Reverb</span>
            <webaudio-switch id="reverbToggle"
                src="${getBaseRacineURL()}assets/img/3-D_Stainless_Switch_2_positions_x4_shadow.png"
                width="50" height="50"
                value="0"
            ></webaudio-switch>
            <span id="switchStatus" class="switch-label">Off</span>
        </div>
        <div class="control-group">
            <span>Mix</span>
            <webaudio-knob id="mixControl"
                src="${getBaseRacineURL()}assets/img/untitled.png"
                min="0" max="1" step="0.01" value="0.5" diameter="64"
            ></webaudio-knob>
        </div>
    </div>
`;

class ReverbComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Nœuds audio
        this.convolverNode = null;
        this.dryGain = null;
        this.wetGain = null;
        this.audioSourceNode = null;

    }

    connectedCallback() {
        this.getElements();
        this.setListeners();
    }

    getElements() {
        this.reverbToggle = this.shadowRoot.getElementById("reverbToggle");
        this.switchStatus = this.shadowRoot.getElementById("switchStatus");
        this.mixControl = this.shadowRoot.getElementById("mixControl");
    }

    async initReverb() {
        if (!this.audioContext) {
            console.error("AudioContext non défini !");
            return;
        }

        try {
            // Charger la réponse impulsionnelle
            const response = await fetch(`${getBaseRacineURL()}assets/1a_marble_hall.wav`);
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement de la réponse impulsionnelle: ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                // Initialisation des nœuds de réverbération
                this.convolverNode = this.audioContext.createConvolver();
                this.convolverNode.buffer = buffer;

                this.dryGain = this.audioContext.createGain();
                this.wetGain = this.audioContext.createGain();
                this.splitterNode = this.audioContext.createGain(); // Création du splitterNode

                // Valeur de mix initiale
                this.wetGain.gain.value = 0.5;
                this.dryGain.gain.value = 0.5;

                console.log("Réverbération initialisée avec succès !");
            });
        } catch (error) {
            console.error("Erreur lors de l'initialisation de la réverbération :", error);
        }
    }



    setListeners() {
        this.reverbToggle.addEventListener("change", () => {
            const isActive = this.reverbToggle.value === "1";
            console.log(this.reverbToggle.value);
            console.log(isActive);
            if (this.reverbToggle.value == "1") {

                this.enableReverb();
                this.switchStatus.textContent = "On";
    
            } else {
                this.disableReverb();
                this.switchStatus.textContent = "Off";

            }
        });

        this.mixControl.addEventListener("input", (event) => {
            const mixValue = parseFloat(event.target.value);
            if (this.dryGain && this.wetGain) {
                this.dryGain.gain.value = 1 - mixValue;
                this.wetGain.gain.value = mixValue;
            }
        });
    }

    
    enableReverb() {
        if (!this.audioSourceNode || !this.convolverNode || !this.dryGain || !this.wetGain) {
            console.error("Impossible d'activer la réverbération : nœuds non initialisés.");
            return;
        }
        const player = document.querySelector('my-player');
        const connectedNodes = player.getConnectedNodes();
        console.log(connectedNodes);
        console.log("Activation de la réverbération...");
        // Connecter les nœuds pour activer la réverbération
        this.audioSourceNode.disconnect();
        this.audioSourceNode.connect(this.dryGain);
        this.audioSourceNode.connect(this.convolverNode);

        this.convolverNode.connect(this.wetGain);
        this.dryGain.connect(this.audioContext.destination);
        this.wetGain.connect(this.audioContext.destination);

    }

    disableReverb() {
        if (!this.audioSourceNode || !this.convolverNode || !this.dryGain || !this.wetGain) {
            console.error("Impossible de désactiver la réverbération : nœuds non initialisés.");
            return;
        }

        console.log("Désactivation de la réverbération...");
        // Déconnecter les nœuds pour désactiver la réverbération
        this.audioSourceNode.disconnect();
        this.audioSourceNode.connect(this.audioContext.destination);

        this.convolverNode.disconnect();
        this.dryGain.disconnect();
        this.wetGain.disconnect();
        // Reconnecte les autres nœuds après la réverbération
        connectedNodes.forEach((node) => {
            if (node !== this.dryGain && node !== this.wetGain) {
                this.audioSourceNode.connect(node);
            }
        });

    }

    setupAudioContext(audioContext) {
        if (!audioContext) {
            console.error("AudioContext invalide !");
            return;
        }
        this.audioContext = audioContext;

        if (!this.dryGain) {
            this.initReverb();
        }
    }

    connectAudioSource(audioSourceNode) {
        if (this.audioSourceNode === audioSourceNode) {
            console.log("Source audio déjà connectée.");
            return;
        }

        this.audioSourceNode = audioSourceNode;

        if (this.convolverNode && this.dryGain && this.wetGain) {
            console.log("Connexion des nœuds audio à la source.");
            this.enableReverb();
        }
    }



}

customElements.define("my-reverb", ReverbComponent);

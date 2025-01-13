

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
        .balance-container {
            display: block;
  
            background-color: #222;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 10px;
            border-radius: 8px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        #knb3 {
            margin-bottom: 0px;
        }
        p {
            text-align: center;
            margin-top: 5px;
        }
    </style>
    <div class="balance-container">
        <webaudio-knob id="knb3"
            src="${getBaseRacineURL()}assets/img/LittlePhatty.png" 
            diameter="64"
            sprites="100" 
            value="0"
            min="-100" 
            max="100" 
            step="20">
        </webaudio-knob>
        <p>Left - Right</p>
    </div>
`;

class Balance extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.filters = [];
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.getElements();
        this.init();
        this.setListeners();
    }

    init() {
        const interval = setInterval(() => {
            if (this.audioContext) {
                this.pannerNode = this.audioContext.createStereoPanner();
                this.addAudioNode(this.pannerNode);
                clearInterval(interval);
            }
        }, 500);
    }

    getElements() {
        this.balanceKnob = this.shadowRoot.getElementById("knb3");
    }

    setListeners() {
        // Écouter les modifications du knob de balance et mettre à jour le pannerNode
        this.balanceKnob.addEventListener('input', (event) => {
            if (this.pannerNode) {
                this.pannerNode.pan.value = parseFloat(event.target.value);
            }
        });
    }

    // Méthode pour connecter l'AudioContext
    setupAudioContext(audioContext) {
        this.audioContext = audioContext;
    }

    // Méthode pour ajouter le pannerNode dans la chaîne audio
    addAudioNode(audioNode) {
        if (this.audioSourceNode) {
            this.audioSourceNode.connect(audioNode);
            audioNode.connect(this.audioContext.destination);
        }
    }

    // Méthode pour connecter une source audio
    connectAudioSource(audioSourceNode) {
        this.audioSourceNode = audioSourceNode;
        if (this.pannerNode) {
            this.audioSourceNode.connect(this.pannerNode);
            this.pannerNode.connect(this.audioContext.destination);
        }
    }
}

customElements.define("my-stereo", Balance);

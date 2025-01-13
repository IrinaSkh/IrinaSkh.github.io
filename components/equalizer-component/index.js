
const getBaseURL = () => {
    return new URL('.', import.meta.url);
};
const getBaseRacineURL = () => {
    return new URL('../../', import.meta.url);
};

const templateEqualizer = document.createElement("template");
templateEqualizer.innerHTML = /*html*/`
    <script src="${getBaseRacineURL()}libs/webaudio-controls.js"></script>
    <style>
    <style>
    .equalizer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        padding: 20px;
        background-color: #333;
        border-radius: 8px;
        color: #fff;
        font-family: Arial, sans-serif;
        height: 400px; /* Ajusté pour plus de hauteur */
        width: 100%; /* Occupe toute la largeur disponible */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .equalizer-container h3 {
        font-size: 18px;
        margin-bottom: 10;
    }

    .sliders-container {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        gap: 10px;
        width: 100%;
        height: 100%;
    }

    .slider-group {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 100%;
        width: 50px; /* Largeur fixe pour chaque groupe */
    }

    .slider-group webaudio-slider {
        height: 150px; /* Hauteur des sliders */
        width: 20px; /* Largeur des sliders */
        --webaudio-slider-track-color: #555; /* Couleur du track */
        --webaudio-slider-thumb-color: #00f; /* Couleur du thumb (manette) */
    }

    .frequency-label {
        font-size: 12px;
        color: #fff;
        margin-top: 10px;
        text-align: center;
    }

    .gain-label {
        font-size: 12px;
        color: #ccc;
        position: absolute;
        top: -20px;
    }

    .preset-selector {
        margin-top: 10px;
        background-color: #222;
        color: #fff;
        border: 1px solid #444;
        padding: 5px;
        border-radius: 4px;
        cursor: pointer;
        width: 100px;
        text-align: center;
        font-size: 14px;
    }

    .preset-selector:hover {
        background-color: #444;
    }
</style>

    </style>
    <div class="equalizer-container">
    <h3>Equalizer</h3>
    <!-- Preset Selector -->

    <!-- Slider Container -->
    <div class="sliders-container">
        <!-- Les sliders seront ajoutés dynamiquement -->
    </div>
</div>

`;

// class EqualizerComponent extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({ mode: "open" });
//         this.shadowRoot.appendChild(templateEqualizer.content.cloneNode(true));

//         // Fréquences des bandes de l'égaliseur (en Hz)
//         this.frequencies = [60, 230, 910, 3600, 14000];

//         // Tableau pour stocker les filtres
//         this.filters = [];

//         // Références pour l'audio
//         this.audioContext = null;
//         this.audioSource = null;

//         // Conteneur des sliders
//         this.slidersContainer = this.shadowRoot.querySelector('.sliders-container');
//     }

//     connectedCallback() {
//         this.initEqualizer();
//     }

//     initEqualizer() {
//         this.frequencies.forEach((frequency, index) => {
//             const filter = this.createFilter(frequency);
//             this.filters.push(filter);
    
//             const sliderGroup = document.createElement('div');
//             sliderGroup.classList.add('slider-group');
    
//             // Crée le slider
//             const slider = document.createElement('webaudio-slider');
//             slider.setAttribute('src', `${getBaseRacineURL()}assets/img/slider_knobman2.png`);
//             slider.setAttribute('min', '-30');
//             slider.setAttribute('max', '30');
//             slider.setAttribute('step', '1');
//             slider.setAttribute('value', '0');
//             slider.setAttribute('direction', 'vert');
//             slider.dataset.filterIndex = index;
//             slider.addEventListener('input', (event) => this.updateGain(event));
    
//             // Label du gain (0dB par défaut)
//             const gainLabel = document.createElement('div');
//             gainLabel.classList.add('gain-label');
//             gainLabel.textContent = '0dB';
    
//             slider.addEventListener('input', () => {
//                 const gainValue = parseFloat(slider.value);
//                 gainLabel.textContent = `${gainValue > 0 ? '+' : ''}${gainValue}dB`;
//             });
    
//             // Label pour la fréquence
//             const frequencyLabel = document.createElement('div');
//             frequencyLabel.classList.add('frequency-label');
//             frequencyLabel.textContent = `${frequency} Hz`;
    
//             sliderGroup.appendChild(gainLabel);
//             sliderGroup.appendChild(slider);
//             sliderGroup.appendChild(frequencyLabel);
    
//             this.slidersContainer.appendChild(sliderGroup);
//         });
//     }
    

//     createFilter(frequency) {
//         if (!this.audioContext) {
//             console.error('AudioContext non défini. Connectez une source audio.');
//             return null;
//         }

//         const filter = this.audioContext.createBiquadFilter();
//         filter.type = 'peaking'; // Utilise un filtre "peaking" pour ajuster la bande de fréquence
//         filter.frequency.value = frequency;
//         filter.Q.value = 1; // Facteur de qualité
//         filter.gain.value = 0; // Gain initial (neutre)

//         return filter;
//     }

//     updateGain(event) {
//         const slider = event.target;
//         const filterIndex = parseInt(slider.dataset.filterIndex, 10);
//         const gain = parseFloat(slider.value);

//         // Met à jour le gain du filtre correspondant
//         this.filters[filterIndex].gain.value = gain;
     
//     }

//     connectAudio(audioContext, audioSource) {
//         this.audioContext = audioContext;
//         this.audioSource = audioSource;

//         // Connecte les filtres en série
//         let previousNode = audioSource;
//         this.filters = this.frequencies.map((frequency) => {
//             const filter = this.createFilter(frequency);
//             previousNode.connect(filter);
//             previousNode = filter;
//             return filter;
//         });

//         // Connecte le dernier filtre à la destination audio
//         previousNode.connect(this.audioContext.destination);
//         console.log('Equalizer connecté à la source audio.');
//     }
// }

// customElements.define("equalizer-component", EqualizerComponent);
class EqualizerComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(templateEqualizer.content.cloneNode(true));

        // Frequencies for the equalizer (in Hz)
        this.frequencies = [60, 230, 910, 3600, 14000];

        // Array to store filters
        this.filters = [];

        // Audio references
        this.audioContext = null;
        this.audioSource = null;

        // Container for sliders
        this.slidersContainer = this.shadowRoot.querySelector(".sliders-container");
    }

    connectedCallback() {
        this.initEqualizer();
    }

    initEqualizer() {
        this.frequencies.forEach((frequency, index) => {
            const filter = this.createFilter(frequency);
            this.filters.push(filter);

            const sliderGroup = document.createElement("div");
            sliderGroup.classList.add("slider-group");

            // Create the slider
            const slider = document.createElement("webaudio-slider");
            slider.setAttribute("src", `${getBaseRacineURL()}assets/img/hsliderbody.png`); // Load the .knob file here
            slider.setAttribute("knobsrc", `${getBaseRacineURL()}assets/img/hsliderknob.png`); // Load the .knob file here
            slider.setAttribute("min", "-30");
            slider.setAttribute("max", "30");
            slider.setAttribute("step", "1");
            slider.setAttribute("value", "0");
            slider.setAttribute("direction", "vert");

            slider.dataset.filterIndex = index;
            slider.addEventListener("input", (event) => this.updateGain(event));

            // Gain label (0dB default)
            const gainLabel = document.createElement("div");
            gainLabel.classList.add("gain-label");
            gainLabel.textContent = "0dB";

            slider.addEventListener("input", () => {
                const gainValue = parseFloat(slider.value);
                gainLabel.textContent = `${gainValue > 0 ? "+" : ""}${gainValue}dB`;
            });

            // Frequency label
            const frequencyLabel = document.createElement("div");
            frequencyLabel.classList.add("frequency-label");
            frequencyLabel.textContent = `${frequency} Hz`;

            sliderGroup.appendChild(gainLabel);
            sliderGroup.appendChild(slider);
            sliderGroup.appendChild(frequencyLabel);

            this.slidersContainer.appendChild(sliderGroup);
        });
    }

    createFilter(frequency) {
        if (!this.audioContext) {
            console.error("AudioContext is not defined. Connect an audio source.");
            return null;
        }

        const filter = this.audioContext.createBiquadFilter();
        filter.type = "peaking"; // Peaking filter for adjusting the frequency band
        filter.frequency.value = frequency;
        filter.Q.value = 1; // Quality factor
        filter.gain.value = 0; // Neutral gain by default

        return filter;
    }

    updateGain(event) {
        const slider = event.target;
        const filterIndex = parseInt(slider.dataset.filterIndex, 10);
        const gain = parseFloat(slider.value);

        // Update the gain of the corresponding filter
        this.filters[filterIndex].gain.value = gain;
    }

    connectAudio(audioContext, audioSource) {
        this.audioContext = audioContext;
        this.audioSource = audioSource;

        // Connect filters in series
        let previousNode = audioSource;
        this.filters = this.frequencies.map((frequency) => {
            const filter = this.createFilter(frequency);
            previousNode.connect(filter);
            previousNode = filter;
            return filter;
        });

        // Connect the last filter to the audio destination
        previousNode.connect(this.audioContext.destination);
        console.log("Equalizer connected to the audio source.");
    }
}

customElements.define("equalizer-component", EqualizerComponent);
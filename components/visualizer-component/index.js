
    const templateOscilloscope = document.createElement('template');
    templateOscilloscope.innerHTML = /*html*/`
        <style>
        <style>
        :host {
            display: block;
            width: 100%;
            background-color: #222;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 10px;
            border-radius: 8px;
        }

        #mount {
            height: 100%;
            background-color: #333;
            border: 1px solid #555;
            border-radius: 8px;
            padding: 10px;
            margin-top: 10px;
            overflow: hidden;
        }

        canvas {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>

        </style>
        <div id="oscilloscope-container">
            <div id="mount"></div>
        </div>
    `;

    class OscilloscopeComponent extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(templateOscilloscope.content.cloneNode(true));

            // Propriétés audio
            this.audioContext = null;
            this.audioSourceNode = null;
            this.analyserNode = null;

            this.pluginInstance = null; // Stockage de l'instance WAM
            this.mount = null; // Conteneur pour le GUI du plugin
        }

        async connectedCallback() {
            this.getElements();
            if (this.audioContext && this.audioSourceNode && this.analyserNode) {
                await this.initializeOscilloscope();
            } else {
                console.warn('AudioContext, AudioSourceNode ou AnalyserNode non fourni depuis le parent.');
            }
            
        }

        getElements() {
            this.mount = this.shadowRoot.querySelector('#mount');
        }

        /**
         * Méthode appelée par le parent pour transmettre l'AudioContext et les nœuds audio.
         * @param {AudioContext} audioContext - L'AudioContext global
         * @param {AudioNode} audioSourceNode - La source audio connectée (par ex. MediaElementSourceNode)
         * @param {AnalyserNode} analyserNode - Le nœud analyseur pour la visualisation
         */
        setAudioContext(audioContext, audioSourceNode, analyserNode) {
            this.audioContext = audioContext;
            this.audioSourceNode = audioSourceNode;
            this.analyserNode = analyserNode;

            console.log('OscilloscopeComponent : AudioContext, AudioSourceNode et AnalyserNode définis.');

            // Initialise le plugin si déjà attaché au DOM
            if (this.isConnected) {
                this.initializeOscilloscope();
            }
        }

        async initializeOscilloscope() {
            const connectPlugin = (audioNode) => {
                this.audioSourceNode.connect(audioNode); // Connecte la source audio au plugin
                audioNode.connect(this.audioContext.destination); // Connecte le plugin à la sortie
            };

            const mountPlugin = (domNode) => {
                this.mount.innerHTML = ''; // Nettoie tout contenu précédent
                this.mount.appendChild(domNode); // Monte le GUI du plugin
            };

            try {
                // Initialisation de WamEnv
                const { default: initializeWamHost } = await import('https://www.webaudiomodules.com/sdk/2.0.0-alpha.6/src/initializeWamHost.js');
                const [hostGroupId] = await initializeWamHost(this.audioContext);

                // Chargement du plugin WAM
                const { default: WAM } = await import('https://www.webaudiomodules.com/community/plugins/wimmics/SRVisualizers/dist/oscilloscope/index.js');

                // Création d'une nouvelle instance du plugin
                const instance = await WAM.createInstance(hostGroupId, this.audioContext);
                this.pluginInstance = instance;

                // Connexion du nœud audio du plugin
                connectPlugin(instance.audioNode);

                // Création et montage de l'interface graphique (GUI)
                const pluginDomNode = await instance.createGui();
                mountPlugin(pluginDomNode);

                console.log('Oscilloscope initialisé et connecté.');
            } catch (error) {
                console.error('Erreur lors de l’initialisation de l’oscilloscope :', error);
            }
        }
    }

    customElements.define('oscilloscope-component', OscilloscopeComponent);

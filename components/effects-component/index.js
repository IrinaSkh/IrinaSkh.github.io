const templateEffect = document.createElement('template');
templateEffect.innerHTML = /*html*/`
    <style>
        :host {
            display: block;
            background-color: #222;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 10px;
            border-radius: 8px;
            height: 100%; /* Permet au composant d'occuper tout l'espace du parent */
            width: 100%; /* Assure que le composant occupe toute la largeur disponible */
            box-sizing: border-box; /* Inclut padding dans les dimensions totales */
        }

        main {
            display: flex;
            flex-direction: column;
            justify-content: center; /* Centrer les éléments enfants verticalement */
            align-items: center; /* Centrer les éléments enfants horizontalement */
            height: 100%; /* Remplir tout l'espace du parent */
            width: 100%;
            overflow: hidden; /* Empêcher les débordements */
        }

        #mount {
            display: flex;
            justify-content: center; /* Centrer horizontalement les enfants */
            align-items: center; /* Centrer verticalement les enfants */
            height: 100%; /* Utiliser toute la hauteur disponible */
            width: 100%; /* Utiliser toute la largeur disponible */
            overflow: hidden; /* Empêche les enfants de dépasser */
            background-color: #333; /* Fond visible pour distinguer le conteneur */
            border-radius: 6px; /* Ajouter un contour arrondi au conteneur */
            margin: 10px; /* Ajouter un peu d'espace autour du conteneur */

        }
    </style>
    <main>
        <div id="mount"></div>
    </main>
`;

class EffectComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(templateEffect.content.cloneNode(true));

        this.audioContext = null; // AudioContext transmis par le parent
        this.audioSourceNode = null; // AudioSourceNode transmis par le parent
        this.mount = null; // Conteneur pour l'interface utilisateur du plugin
        this.pluginInstance = null; // Instance du plugin WAM
        this.isInitialized = false; // Flag pour éviter l'initialisation multiple
    }

    connectedCallback() {
        this.getElements();
    }

    getElements() {
        this.mount = this.shadowRoot.querySelector('#mount');
    }

    /**
     * Méthode pour définir l'AudioContext et la source audio depuis le parent
     * @param {AudioContext} audioContext - Le contexte audio à utiliser
     * @param {AudioNode} audioSourceNode - La source audio à connecter
     */
    async setAudioContext(audioContext, audioSourceNode) {
        if (this.isInitialized) {
            console.warn('EffectComponent est déjà initialisé. Ignoré.');
            return;
        }

        this.audioContext = audioContext;
        this.audioSourceNode = audioSourceNode;

        console.log('EffectComponent a reçu l’AudioContext et l’AudioSourceNode.');
        await this.initializePlugin();
    }

    /**
     * Méthode pour initialiser le plugin WAM
     */
    async initializePlugin() {
        if (!this.audioContext || !this.audioSourceNode) {
            console.error('AudioContext ou AudioSourceNode non définis.');
            return;
        }
        if (this.isInitialized) {
            console.log('Plugin déjà initialisé, rien à faire.');
            return;
        }
        const connectPlugin = (audioNode) => {
            this.audioSourceNode.connect(audioNode);
            audioNode.connect(this.audioContext.destination);
        };

        const mountPlugin = (domNode) => {
            // Nettoyer le conteneur avant de monter un nouvel élément
            this.mount.innerHTML = '';
            this.mount.appendChild(domNode);
            
        };

        try {
            // Initialisation de WamEnv
            const { default: initializeWamHost } = await import('https://www.webaudiomodules.com/sdk/2.0.0-alpha.6/src/initializeWamHost.js');
            const [hostGroupId] = await initializeWamHost(this.audioContext);

            // Importation du plugin WAM
            const { default: WAM } = await import('https://www.webaudiomodules.com/community/plugins/wimmics/OwlShimmer/index.js');

            // Création d'une instance du plugin
            const instance = await WAM.createInstance(hostGroupId, this.audioContext);
            this.pluginInstance = instance;

            // Connexion de l'audioNode du plugin à la chaîne audio
            connectPlugin(instance.audioNode);

            // Création de l'interface utilisateur et montage dans le DOM
            const pluginDomNode = await instance.createGui();
            mountPlugin(pluginDomNode);

            console.log('Plugin WAM initialisé et connecté.');
            this.isInitialized = true; // Marquer comme initialisé
        } catch (error) {
            console.error('Erreur lors de l’initialisation du plugin WAM :', error);
        }
    }
}

customElements.define('effect-component', EffectComponent);


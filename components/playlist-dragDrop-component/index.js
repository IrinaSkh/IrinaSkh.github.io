const templateDragDrop = document.createElement('template');

// Fonctions utilitaires pour calculer les URLs de base
const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

const getBaseRacineURL = () => {
    return new URL('../../', import.meta.url);
};

templateDragDrop.innerHTML = `
    <style>
        #dropZone {
            border: 2px dashed #ccc;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            transition: background-color 0.3s ease;
            margin-bottom: 10px;
        }

        #dropZone.dragover {
            background-color: #e0f7fa;
            border-color: #00796b;
        }

        #dropZone p {
            margin: 0;
            font-size: 16px;
            color: #777;
        }

        #fileInput {
            display: none;
        }

        #fileInputLabel {
            display: inline-block;
            margin-top: 10px;
            padding: 10px 20px;
            background-color: #00796b;
            color: white;
            font-size: 14px;
            font-family: Arial, sans-serif;
            text-align: center;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        #fileInputLabel:hover {
            background-color: #005a4a;
        }
    </style>
    <div id="dropZone">
        <p>Glissez et déposez vos musiques ici</p>
    </div>
    <input id="fileInput" type="file" multiple accept="audio/*">
    <label id="fileInputLabel" for="fileInput">Sélectionner des fichiers</label>
`;

class PlaylistDragDrop extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(templateDragDrop.content.cloneNode(true));

        // Élément de la zone de drop
        this.dropZone = this.shadowRoot.getElementById('dropZone');
        this.fileInput = this.shadowRoot.getElementById('fileInput');
    }

    connectedCallback() {
        this.setupDragDrop();
        this.setupFileInput();
    }

    setupDragDrop() {
        // Empêcher le comportement par défaut du navigateur
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
            this.dropZone.addEventListener(eventName, (event) => event.preventDefault());
        });

        // Ajouter la classe "dragover" pour les événements dragenter/dragover
        ['dragenter', 'dragover'].forEach((eventName) => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.add('dragover');
            });
        });

        // Retirer la classe "dragover" pour les événements dragleave/drop
        ['dragleave', 'drop'].forEach((eventName) => {
            this.dropZone.addEventListener(eventName, () => {
                this.dropZone.classList.remove('dragover');
            });
        });

        // Gestion du drop (ajout de fichiers)
        this.dropZone.addEventListener('drop', (event) => this.handleFiles(event.dataTransfer.files));
    }

    setupFileInput() {
        // Gestion de la sélection des fichiers via input
        this.fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            this.handleFiles(files);
        });
    }

    handleFiles(fileList) {
        for (const file of fileList) {
            // Vérifier si le fichier est un fichier audio
            if (file.type.startsWith('audio/')) {
                const fileUrl = URL.createObjectURL(file); // Génère une URL temporaire pour le fichier

                const track = {
                    url: fileUrl, // URL temporaire pour le fichier audio
                    title: file.name.replace(/\.[^/.]+$/, ''), // Nom du fichier sans extension
                    author: 'Utilisateur', // Auteur par défaut
                    source: 'file-selection',
                };

                // Déclencher un événement personnalisé pour informer le parent
                this.dispatchEvent(
                    new CustomEvent('trackAdded', {
                        detail: track, // Données de la piste ajoutée
                        bubbles: true, // Permet la propagation de l'événement
                        composed: true, // Permet de traverser le Shadow DOM
                    })
                );
            } else {
                // Afficher un message d'erreur si le fichier n'est pas audio
                console.error('Fichier non pris en charge :', file.name);
                alert(`"${file.name}" n'est pas un fichier audio valide. Seuls les fichiers audio sont acceptés.`);
            }
        }
    }
}

customElements.define('playlist-drag-drop', PlaylistDragDrop);




import '../playlist-dragDrop-component/index.js';

const template = document.createElement('template');

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};
const getBaseRacineURL = () => {
    return new URL('../../', import.meta.url);
};

template.innerHTML = `
<style>
    .playlist-container {
        font-family: Arial, sans-serif;
        width: 100%; /* S'adapte au conteneur parent */
        height: 100%; /* S'étend pour remplir le conteneur */
        overflow-y: auto; /* Ajoute un défilement vertical si le contenu dépasse */
        box-sizing: border-box; /* Inclut les bordures et le padding dans la largeur/hauteur */
    }

    h3 {
        text-align: center;
        margin: 10px 0;
        font-size: 16px;
        color: #fff;
        background-color: #444;
        padding: 10px;
        border-radius: 5px;
    }

    .track {
        padding: 8px;
        cursor: pointer;
        border-bottom: 1px solid #ccc;
        white-space: nowrap; /* Empêche le texte de déborder */
        overflow: hidden; /* Cache le texte qui déborde */
        text-overflow: ellipsis; /* Ajoute "..." pour les textes coupés */
        color: #fff;
        background-color: #333;
    }

    .track:hover {
        background-color: #555;
    }

    .track.active {
        background-color: #444;
        font-weight: bold;
    }

    .track.new-track {
        background-color: #e0f7fa;
        transition: background-color 1s ease;
    }

    .track.drag-over {
        background-color: #555;
        border: 2px dashed #00796b;
    }

    playlist-drag-drop {
        display: block;
        width: 100%;
        margin-top: 10px;
    }
</style>

    <div class="playlist-container">
        <h3>Playlist</h3>
        <div id="trackList"></div>
        <playlist-drag-drop></playlist-drag-drop>
    </div>
`;

class PlaylistComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Élément contenant la liste des pistes
        this.trackListElement = this.shadowRoot.getElementById("trackList");
        this.currentTrackIndex = 0; // Index de la piste actuelle

        // Liste globale des pistes
        this.playList = [];

        // URL du fichier JSON contenant les informations de la playlist
        const jsonUrlAttribute = this.getAttribute("json-url");
        this.jsonFileUrl = jsonUrlAttribute
            ? new URL(jsonUrlAttribute, getBaseRacineURL())
            : new URL('track.json', getBaseRacineURL());
    }

    async connectedCallback() {
        console.log("Chargement de la playlist...");

        // Charger les pistes depuis le JSON
        await this.loadPlaylistFromLocalJSON();

        // Ajouter un écouteur pour les pistes ajoutées via drag-and-drop
        const dragDropComponent = this.shadowRoot.querySelector('playlist-drag-drop');
        dragDropComponent.addEventListener('trackAdded', (event) => this.addTrack(event.detail));
        dragDropComponent.addEventListener('invalidFile', (event) => this.handleInvalidFile(event.detail));

        // Rendre la playlist
        this.renderPlaylist();
    }

    async loadPlaylistFromLocalJSON() {
        try {
            const response = await fetch(this.jsonFileUrl);
            const data = await response.json();

            // Ajouter les pistes du JSON à la liste globale
            const jsonTracks = data.map((track, index) => ({
                url: track.url,
                author: track.author,
                title: track.title,
                index: index,
                source: "json", // Identifie la source comme étant le JSON
            }));

            this.playList = [...this.playList, ...jsonTracks];
        } catch (error) {
            console.error("Erreur lors du chargement de la playlist depuis le fichier JSON :", error);
        }
    }

    handleInvalidFile({ fileName }) {
        alert(`"${fileName}" n'est pas un fichier audio valide. Veuillez sélectionner uniquement des fichiers audio.`);
    }

    addTrack(track) {
        // Vérifier si la piste existe déjà
        const exists = this.playList.some((item) => item.url === track.url);
        if (!exists) {
            this.playList.push(track);
            this.renderPlaylist();
        } else {
            alert(`Le fichier "${track.title}" est déjà dans la playlist.`);
        }
    }

    renderPlaylist() {
        try {
            this.trackListElement.innerHTML = ''; // Réinitialiser la liste

            this.playList.forEach((track, index) => {
                const trackElement = document.createElement("div");
                trackElement.classList.add("track");
                trackElement.setAttribute('draggable', true); // Rendre les pistes déplaçables
                trackElement.dataset.index = index;

                if (index === this.currentTrackIndex) {
                    trackElement.classList.add("active");
                }

                trackElement.textContent = `${track.title} - ${track.author}`;

                // Ajout des événements pour le drag-and-drop
                trackElement.addEventListener("dragstart", (e) => this.onDragStart(e, index));
                trackElement.addEventListener("dragover", (e) => this.onDragOver(e, index));
                trackElement.addEventListener("drop", (e) => this.onDrop(e, index));
                trackElement.addEventListener("dragleave", (e) => this.onDragLeave(e, index));

                // Ajout d'un écouteur de clic pour sélectionner une piste
                trackElement.addEventListener("click", () => this.selectTrack(index));
                this.trackListElement.appendChild(trackElement);
            });
        } catch (error) {
            console.error("Erreur lors de l'affichage de la playlist :", error);
        }
    }

    onDragStart(event, index) {
        // Stocke l'index de l'élément déplacé
        event.dataTransfer.setData("text/plain", index);
        event.target.classList.add("dragging");
    }

    onDragOver(event, index) {
        event.preventDefault(); // Permet le drop
        const trackElement = event.target;
        trackElement.classList.add("drag-over");
    }

    onDragLeave(event, index) {
        const trackElement = event.target;
        trackElement.classList.remove("drag-over");
    }

    onDrop(event, targetIndex) {
        event.preventDefault();

        // Récupère l'index de l'élément déplacé
        const draggedIndex = parseInt(event.dataTransfer.getData("text/plain"), 10);

        // Réorganise la playlist
        if (draggedIndex !== targetIndex) {
            const [draggedTrack] = this.playList.splice(draggedIndex, 1);
            this.playList.splice(targetIndex, 0, draggedTrack);
        }

        // Rafraîchit la liste
        this.renderPlaylist();
    }

    selectTrack(index) {
        if (!this.playList || index < 0 || index >= this.playList.length) return;

        this.currentTrackIndex = index;
        this.renderPlaylist();

        // Déclencher un événement personnalisé pour signaler la sélection
        this.dispatchEvent(
            new CustomEvent('trackSelected', {
                detail: {
                    track: this.playList[index],
                    index: index,
                },
            })
        );
    }

    nextTrack() {
        if (this.currentTrackIndex < this.playList.length - 1) {
            this.currentTrackIndex++;
            this.selectTrack(this.currentTrackIndex);
        }
    }

    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            this.selectTrack(this.currentTrackIndex);
        }
    }
}

customElements.define('playlist-component', PlaylistComponent);

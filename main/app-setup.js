
// File: app-setup.js - v1.34
// Responsabile dell'impostazione iniziale, creazione UI dinamica, listeners principali.

let currentSongDataForSave = null;
let glossaryChordData = {};
let CHORD_LIB = {};
let currentMidiData = null; // Dati della canzone attualmente generata
let midiSectionTitleElement = null; // Elemento H3 per il titolo della sezione download MIDI


document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');
    const songOutputContainer = document.getElementById('song-output-container');
  const keySelectionDropdown = document.getElementById('keySelection');
    const structureDropdown = document.getElementById('songStructure');

    // I pulsanti di azione sono ora definiti staticamente in index.html
    // La logica qui si occuperà solo di gestirli.

    // --- Popolamento dropdown tonalità ---
   if (keySelectionDropdown && typeof possibleKeysAndModes !== 'undefined' && possibleKeysAndModes.length > 0) {
        possibleKeysAndModes.forEach(keyInfoLoop => {
            const option = document.createElement('option');
            option.value = `${keyInfoLoop.root}_${keyInfoLoop.mode}`;
            option.textContent = keyInfoLoop.name;
            keySelectionDropdown.appendChild(option);
        });
        const randomOption = keySelectionDropdown.querySelector('option[value="random"]');
        if (randomOption) randomOption.textContent = "Random";
    }


    const moodDropdown = document.getElementById('mood');

    const populateStructures = (mood = null) => {
        structureDropdown.innerHTML = '<option value="random" selected>Random (based on Mood)</option>'; // Pulisce e aggiunge l'opzione random

        let templates = SONG_STRUCTURE_TEMPLATES;
        if (mood) {
            templates = SONG_STRUCTURE_TEMPLATES.filter(t => t.mood === mood);

        }


        templates.forEach(template => {
            const opt = document.createElement('option');
            opt.value = template.id;
            opt.textContent = template.name;
            structureDropdown.appendChild(opt);
        });
    };

    if (typeof loadSongStructures === 'function') {
        loadSongStructures().then(() => {
            populateStructures(moodDropdown.value); // Popola inizialmente con il mood selezionato
        }).catch(() => {
            console.error("Could not load structures for dropdown.");
        });

    }


    moodDropdown.addEventListener('change', (event) => {
        populateStructures(event.target.value);
    });

    // --- Inizializzazione libreria accordi ---
    if (typeof buildChordLibrary === "function") {
        CHORD_LIB = buildChordLibrary();
    } else {
        console.error("buildChordLibrary function not found! Chord functionalities will be limited.");
    }

    // --- Event Listener principale ---
    if (generateButton) {
        if (typeof generateSongArchitecture === "function") {
            generateButton.addEventListener('click', generateSongArchitecture);
        } else {
            console.error("generateSongArchitecture function not found! Generation will not work.");
            generateButton.disabled = true;
            generateButton.textContent = 'Error: Setup Incomplete';
        }
    }

    // Definisci attachActionListenersGlobal per essere chiamata dopo la generazione della UI
    window.attachActionListenersGlobal = function() {
        const saveBtn = document.getElementById('saveSongButton');
        if (saveBtn && typeof handleSaveSong === "function") {
            saveBtn.onclick = handleSaveSong;
        }

        const singleTrackChordBtn = document.getElementById('downloadSingleTrackChordMidiButton');
        if (singleTrackChordBtn && typeof handleGenerateSingleTrackChordMidi === "function") {
            singleTrackChordBtn.onclick = handleGenerateSingleTrackChordMidi;
        }

        // Listener per il nuovo pulsante "Chords Rhythm"
        const chordRhythmBtn = document.getElementById('generateChordRhythmButton'); // Usa il nuovo ID
        if (chordRhythmBtn && typeof handleGenerateChordRhythm === "function") {
            chordRhythmBtn.onclick = handleGenerateChordRhythm;
        } else if(chordRhythmBtn) {
            console.warn("handleGenerateChordRhythm function not found for 'Chords Rhythm' button.");
        }

        const melodyBtn = document.getElementById('generateMelodyButton');
        if (melodyBtn && typeof handleGenerateMelody === "function") {
            melodyBtn.onclick = handleGenerateMelody;
        }

        const vocalBtn = document.getElementById('generateVocalLineButton');
        if (vocalBtn && typeof handleGenerateVocalLine === "function") {
            vocalBtn.onclick = handleGenerateVocalLine;
        }

        const bassBtn = document.getElementById('generateBassLineButton');
        if (bassBtn && typeof handleGenerateBassLine === "function") {
            bassBtn.onclick = handleGenerateBassLine;
        }

        const drumBtn = document.getElementById('generateDrumTrackButton');
        if (drumBtn && typeof handleGenerateDrumTrack === "function") {
            drumBtn.onclick = handleGenerateDrumTrack;
        }

        document.querySelectorAll('.shape-select').forEach(selectElement => {
            const newSelect = selectElement.cloneNode(true);
            selectElement.parentNode.replaceChild(newSelect, selectElement);
            if (typeof handleShapeChange === "function") { // handleShapeChange è in app-ui-render.js
                newSelect.addEventListener('change', handleShapeChange);
            }
        });

        // Listener per i nuovi generatori
        const helpers = { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType };
        document.getElementById('generateCountermelodyButton').addEventListener('click', () => addTrackToMidiData('Countermelody', generateCountermelodyForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateTextureButton').addEventListener('click', () => addTrackToMidiData('Texture', generateTextureForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateDronesButton').addEventListener('click', () => addTrackToMidiData('Drones', generateDronesForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateOrnamentButton').addEventListener('click', () => addTrackToMidiData('Ornament', generateOrnamentForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateMiasmaticButton').addEventListener('click', () => addTrackToMidiData('Miasmatic', generateMiasmaticForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generatePercussionButton').addEventListener('click', () => addTrackToMidiData('Percussion', generatePercussionForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateGlitchFxButton').addEventListener('click', () => addTrackToMidiData('GlitchFx', generateGlitchFxForSong(currentMidiData, helpers, sectionCache)));
    };
});

function addTrackToMidiData(trackName, trackEvents) {
    if (!currentMidiData) {
        alert("Please generate a song first.");
        return;
    }
    if (!currentMidiData.tracks) {
        currentMidiData.tracks = {};
    }
    currentMidiData.tracks[trackName] = trackEvents;
    console.log(`SUCCESS: ${trackName} track generated with ${trackEvents.length} events.`);
    alert(`${trackName} track generated!`);
    // Aggiungere logica per aggiornare la UI qui, se necessario
}

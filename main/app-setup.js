
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

    // --- Creazione dinamica dei pulsanti di azione ---
    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.id = 'action-buttons';
    actionButtonsContainer.className = 'action-buttons-container';
    actionButtonsContainer.style.display = 'none';

    const newGeneratorsSection = document.createElement('div');
    newGeneratorsSection.className = 'new-generators-section';
    newGeneratorsSection.style.display = 'none';

    const createButton = (id, text, container) => {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = text;
        button.className = 'action-button';
        container.appendChild(button);
    };

    // Pulsanti originali
    createButton('saveSongButton', 'Save Song Data', actionButtonsContainer);
    createButton('downloadSingleTrackChordMidiButton', 'Pad', actionButtonsContainer);
    createButton('generateChordRhythmButton', 'Arpeggiator', actionButtonsContainer);
    createButton('generateMelodyButton', 'Inspiration (Melody)', actionButtonsContainer);
    createButton('generateVocalLineButton', 'Vocal Shame Machine', actionButtonsContainer);
    createButton('generateBassLineButton', 'Deekonizer (bass)', actionButtonsContainer);
    createButton('generateDrumTrackButton', 'LingoStarr (drum)', actionButtonsContainer);

    // Nuovi pulsanti
    createButton('generateCountermelodyButton', 'Countermelody', newGeneratorsSection);
    createButton('generateTextureButton', 'Texture', newGeneratorsSection);
    createButton('generateOrnamentButton', 'Ornament', newGeneratorsSection);
    createButton('generateMiasmaticButton', 'Miasmatic', newGeneratorsSection);
    createButton('generateDronesButton', 'Drones', newGeneratorsSection);
    createButton('generatePercussionButton', 'Percussion', newGeneratorsSection);
    createButton('generateGlitchFxButton', 'Glitch fx', newGeneratorsSection);

    // Inserimento dei contenitori nel DOM
    if (songOutputContainer) {
        if (!midiSectionTitleElement) {
            midiSectionTitleElement = document.createElement('h3');
            midiSectionTitleElement.id = 'midiDownloadTitle';
            midiSectionTitleElement.className = 'chord-glossary-title';
            midiSectionTitleElement.textContent = 'Download your global hit in MIDI format';
            midiSectionTitleElement.style.display = 'none';
            midiSectionTitleElement.style.marginTop = '30px';
            songOutputContainer.insertBefore(midiSectionTitleElement, songOutputDiv.nextSibling);
        }
        songOutputContainer.insertBefore(actionButtonsContainer, midiSectionTitleElement.nextSibling);
        songOutputContainer.insertBefore(newGeneratorsSection, actionButtonsContainer.nextSibling);

    } else if (songOutputDiv && songOutputDiv.parentNode) {
        songOutputDiv.parentNode.insertBefore(actionButtonsContainer, songOutputDiv.nextSibling);
        songOutputDiv.parentNode.insertBefore(newGeneratorsSection, actionButtonsContainer.nextSibling);
    } else {
        document.body.appendChild(actionButtonsContainer);
        document.body.appendChild(newGeneratorsSection);
    }

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
        const addListener = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        };

        addListener('saveSongButton', handleSaveSong);
        addListener('downloadSingleTrackChordMidiButton', handleGenerateSingleTrackChordMidi);
        addListener('generateChordRhythmButton', handleGenerateChordRhythm);
        addListener('generateMelodyButton', handleGenerateMelody);
        addListener('generateVocalLineButton', handleGenerateVocalLine);
        addListener('generateBassLineButton', handleGenerateBassLine);
        addListener('generateDrumTrackButton', handleGenerateDrumTrack);

        const helpers = {
            getChordNotes,
            NOTE_NAMES,
            normalizeSectionName,
            getRandomElement,
            getPitchFromSymbol,
            getChordRootAndType,
            getDiatonicChords // Aggiunto
        };
        document.getElementById('generateCountermelodyButton').addEventListener('click', () => addTrackToMidiData('Countermelody', generateCountermelodyForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateTextureButton').addEventListener('click', () => addTrackToMidiData('Texture', generateTextureForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateDronesButton').addEventListener('click', () => addTrackToMidiData('Drones', generateDronesForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateOrnamentButton').addEventListener('click', () => addTrackToMidiData('Ornament', generateOrnamentForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateMiasmaticButton').addEventListener('click', () => addTrackToMidiData('Miasmatic', generateMiasmaticForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generatePercussionButton').addEventListener('click', () => addTrackToMidiData('Percussion', generatePercussionForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('generateGlitchFxButton').addEventListener('click', () => addTrackToMidiData('GlitchFx', generateGlitchFxForSong(currentMidiData, helpers, sectionCache)));
        document.getElementById('exportAllButton').addEventListener('click', () => handleExportAllTracks());
    };
});

function addTrackToMidiData(trackName, trackEvents) {
    if (!currentMidiData) {
        alert("Please generate a song first.");
        return;
    }
    if (trackEvents && trackEvents.length > 0) {
        const fileName = `${currentMidiData.title.replace(/[^a-zA-Z0-9_]/g, '_')}_${trackName}.mid`;
        downloadSingleTrackMidi(trackName, trackEvents, fileName, currentMidiData.bpm, currentMidiData.timeSignatureChanges);
    } else {
        alert(`Could not generate ${trackName} track with the current data.`);
    }
}

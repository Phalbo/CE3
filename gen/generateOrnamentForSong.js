// gen/generateOrnamentForSong.js
const ORNAMENTS = {
    trill: (pitch, startTick, helpers) => {
        const ticksPer32nd = 16; // Durata di una biscroma
        return [
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick, velocity: 85 },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd, velocity: 85 },
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 2, velocity: 85 },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 3, velocity: 85 }
        ];
    },
    graceNote: (pitch, startTick, helpers) => {
        const ticksPer64th = 8; // Durata cortissima
        return [
            { pitch: [pitch - 3], duration: `T${ticksPer64th}`, startTick: startTick, velocity: 90 },
            { pitch: [pitch], duration: `T${ticksPer64th * 3}`, startTick: startTick + ticksPer64th, velocity: 80 }
        ];
    }
};

function generateOrnamentForSong(songData, helpers) {
    console.log("Ornament Generator: Avviato."); // LOG 1
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;

    songData.sections.forEach(section => {
        section.mainChordSlots.forEach(slot => {
            if (Math.random() < 0.15) {
                console.log("Ornament Generator: Tentativo di generare ornamento per lo slot:", slot.chordName); // LOG 2
                const chordNotes = getChordNotes(slot.chordName).notes;

                if (!chordNotes || chordNotes.length === 0) {
                     console.error("Ornament Generator: Fallito. Nessuna nota trovata per l'accordo:", slot.chordName); // LOG 3
                     return; // Esce se non trova note
                }

                const ornamentType = Math.random() < 0.5 ? 'trill' : 'graceNote';
                const targetNote = chordNotes[1] || chordNotes[0];
                if (!targetNote) return;

                const pitch = NOTE_NAMES.indexOf(targetNote) + 60;
                const ornamentStartTick = (slot.effectiveStartTickInSection + slot.effectiveDurationTicks) - 64;

                const ornamentEvents = ORNAMENTS[ornamentType](pitch, ornamentStartTick, helpers);
                track.push(...ornamentEvents);
                console.log(`Ornament Generator: Ornamento '${ornamentType}' creato con successo.`); // LOG 4
            }
        });
    });
    console.log("Ornament Generator: Processo completato. Eventi totali:", track.length); // LOG 5
    return track;
}

// gen/generateOrnamentForSong.js
const ORNAMENTS = {
    trill: (pitch, startTick, helpers) => {
        const ticksPer32nd = 16; // Durata di una biscroma
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd, velocity: velocity },
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 2, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 3, velocity: velocity }
        ];
    },
    graceNote: (pitch, startTick, helpers) => {
        const ticksPer64th = 8; // Durata cortissima
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch - 3], duration: `T${ticksPer64th}`, startTick: startTick, velocity: velocity + 10 },
            { pitch: [pitch], duration: `T${ticksPer64th * 3}`, startTick: startTick + ticksPer64th, velocity: velocity }
        ];
    },
    mordent: (pitch, startTick, helpers) => {
        const ticksPer32nd = 16;
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch - 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd, velocity: velocity - 10 },
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 2, velocity: velocity },
        ];
    },
    gruppetto: (pitch, startTick, helpers) => {
        const ticksPer64th = 8;
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th, velocity: velocity - 5 },
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 2, velocity: velocity - 10 },
            { pitch: [pitch - 2], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 3, velocity: velocity - 5 },
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 4, velocity: velocity },
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

                const ornamentType = ["trill", "graceNote", "mordent", "gruppetto"][Math.floor(Math.random() * 4)];
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

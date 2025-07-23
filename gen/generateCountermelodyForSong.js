// gen/generateCountermelodyForSong.js
function generateCountermelodyForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;
    const ticksPerEighth = 64; // Durata di un ottavo

    if (!sectionCache.countermelody) {
        sectionCache.countermelody = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.countermelody[baseName]) {
            const cachedSection = sectionCache.countermelody[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach((slot) => {
            const chordNotes = getChordNotes(slot.chordName).notes;
            if (chordNotes.length < 3) return;

            const pitches = chordNotes.map(n => NOTE_NAMES.indexOf(n) + 60);
            if (chordNotes.length > 3) {
                pitches.push(NOTE_NAMES.indexOf(chordNotes[3]) + 60); // Add seventh
            }

            const patterns = [
                [0, 1, 2, 1], // Arpeggio ascendente
                [2, 1, 0, 1], // Arpeggio discendente
                [0, 2, 1, 3], // Arpeggio con settima
                [0, 1, 2, 3, 2, 1, 0] // Scala completa
            ];

            const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];

            for (let i = 0; i < slot.effectiveDurationTicks / ticksPerEighth; i++) {
                const noteStartTick = slot.effectiveStartTickInSection + (i * ticksPerEighth);
                if (noteStartTick < (slot.effectiveStartTickInSection + slot.effectiveDurationTicks)) {
                    const pitchIndex = selectedPattern[i % selectedPattern.length];
                    if(pitches[pitchIndex]){
                        sectionTrack.push({
                            pitch: [pitches[pitchIndex]],
                            duration: `T${ticksPerEighth}`,
                            startTick: noteStartTick,
                            velocity: 70 + Math.floor(Math.random() * 15)
                        });
                    }
                }
            }
        });

        sectionCache.countermelody[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

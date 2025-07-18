// gen/generateCountermelodyForSong.js
function generateCountermelodyForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;
    const ticksPerBeat = (4 / 4) * 128; // Assumiamo 4/4 per la ritmica interna

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
        section.mainChordSlots.forEach((slot, slotIndex) => {
            const chordNotes = getChordNotes(slot.chordName).notes;
            if (chordNotes.length < 3) return;

            const rootPitch = NOTE_NAMES.indexOf(chordNotes[0]) + 48;
            const thirdPitch = NOTE_NAMES.indexOf(chordNotes[1]) + 48;
            const fifthPitch = NOTE_NAMES.indexOf(chordNotes[2]) + 48;

            const pattern = (slotIndex % 2 === 0)
                ? [rootPitch, thirdPitch, fifthPitch, thirdPitch]
                : [fifthPitch, thirdPitch, rootPitch, thirdPitch];

            for (let i = 0; i < pattern.length; i++) {
                const noteStartTick = slot.effectiveStartTickInSection + (i * ticksPerBeat);
                if (noteStartTick < (slot.effectiveStartTickInSection + slot.effectiveDurationTicks)) {
                    sectionTrack.push({
                        pitch: [pattern[i]],
                        duration: `T${ticksPerBeat}`,
                        startTick: noteStartTick,
                        velocity: 65 + Math.floor(Math.random() * 10)
                    });
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

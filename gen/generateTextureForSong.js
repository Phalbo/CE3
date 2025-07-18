// gen/generateTextureForSong.js
function generateTextureForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;

    if (!sectionCache.texture) {
        sectionCache.texture = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.texture[baseName]) {
            const cachedSection = sectionCache.texture[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            const chordNotes = getChordNotes(slot.chordName).notes;
            if (chordNotes.length < 2) return;

            const rootPitch = NOTE_NAMES.indexOf(chordNotes[0]) + 72;
            const fifthPitch = NOTE_NAMES.indexOf(chordNotes[2] || chordNotes[0]) + 72;
            const ninthPitch = rootPitch + 14;

            sectionTrack.push({
                pitch: [rootPitch, fifthPitch, ninthPitch],
                duration: `T${slot.effectiveDurationTicks}`,
                startTick: slot.effectiveStartTickInSection,
                velocity: 35
            });
        });

        sectionCache.texture[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

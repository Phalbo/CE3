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

function generateOrnamentForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;

    if (!sectionCache.ornament) {
        sectionCache.ornament = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.ornament[baseName]) {
            const cachedSection = sectionCache.ornament[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            if (Math.random() < 0.15) {
                const ornamentType = Math.random() < 0.5 ? 'trill' : 'graceNote';
                const chordNotes = getChordNotes(slot.chordName).notes;
                const targetNote = chordNotes[1] || chordNotes[0];
                if (!targetNote) return;

                const pitch = NOTE_NAMES.indexOf(targetNote) + 60;
                const ornamentStartTick = (slot.effectiveStartTickInSection + slot.effectiveDurationTicks) - 64;

                const ornamentEvents = ORNAMENTS[ornamentType](pitch, ornamentStartTick, helpers);
                sectionTrack.push(...ornamentEvents);
            }
        });

        sectionCache.ornament[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

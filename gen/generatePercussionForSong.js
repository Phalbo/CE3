// gen/generatePercussionForSong.js
const PERC_MIDI_NOTES = { Kick: 36, Snare: 38, HiHat: 42 };
const PERC_PATTERNS = {
    '4/4': [
        { name: 'Rock', weight: 40, pattern: [{p: 'Kick', b: 1}, {p: 'Snare', b: 3}, {p: 'HiHat', b: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]}] },
        { name: 'Funk', weight: 30, pattern: [{p: 'Kick', b: [1, 3.5]}, {p: 'Snare', b: 3}, {p: 'HiHat', b: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]}] },
        { name: 'Latin', weight: 30, pattern: [{p: 'Kick', b: [1, 2.5, 4]}, {p: 'Snare', b: 3, type:'rimshot'}, {p: 'HiHat', b: [1, 2, 3, 4]}] }
    ]
};

function generatePercussionForSong(songData, helpers, sectionCache) {
    const track = [];
    const { normalizeSectionName, getRandomElement } = helpers;
    const ticksPerBeat = 128;

    if (!sectionCache.percussion) {
        sectionCache.percussion = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.percussion[baseName]) {
            const cachedSection = sectionCache.percussion[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        const tsKey = `${section.timeSignature[0]}/${section.timeSignature[1]}`;
        const beatsPerMeasure = section.timeSignature[0];
        let pattern;

        if (PERC_PATTERNS[tsKey]) {
            pattern = getRandomElement(PERC_PATTERNS[tsKey]).pattern;
        } else {
            pattern = [{p: 'Kick', b: 1}, {p: 'Snare', b: (beatsPerMeasure / 2) + 1}, {p: 'HiHat', b: Array.from({length: beatsPerMeasure * 2}, (_, i) => 1 + i * 0.5)}];
        }

        for (let m = 0; m < section.measures; m++) {
            const measureStartTick = (m * beatsPerMeasure * ticksPerBeat);
            pattern.forEach(instrument => {
                const beats = Array.isArray(instrument.b) ? instrument.b : [instrument.b];
                beats.forEach(beat => {
                    sectionTrack.push({
                        pitch: [PERC_MIDI_NOTES[instrument.p]],
                        duration: 'T64',
                        startTick: measureStartTick + ((beat - 1) * ticksPerBeat),
                        velocity: instrument.p === 'HiHat' ? 70 : 100
                    });
                });
            });
        }

        sectionCache.percussion[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

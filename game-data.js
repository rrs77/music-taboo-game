// Orchestra instruments with educational content for 10-11 year olds
const DEFAULT_INSTRUMENTS = [
    // STRINGS
    { 
        id: 1, 
        title: 'Violin', 
        family: 'Strings', 
        hint: 'Smallest string instrument, played with a bow', 
        taboo: ['bow', 'small', 'strings', 'high', 'fiddle'],
        soundMethod: 'Bowed strings vibrate',
        size: 'Smallest (about 60cm)',
        sound: 'High and bright',
        position: 'Front of orchestra'
    },
    { 
        id: 2, 
        title: 'Viola', 
        family: 'Strings', 
        hint: 'Slightly larger than violin, deeper sound', 
        taboo: ['violin', 'larger', 'strings', 'bow', 'medium'],
        soundMethod: 'Bowed strings vibrate',
        size: 'Medium-small (about 66cm)',
        sound: 'Warmer and deeper than violin',
        position: 'Front of orchestra'
    },
    { 
        id: 3, 
        title: 'Cello', 
        family: 'Strings', 
        hint: 'Large string instrument, player sits down', 
        taboo: ['bow', 'large', 'strings', 'sit', 'deep'],
        soundMethod: 'Bowed strings vibrate',
        size: 'Large (about 125cm)',
        sound: 'Rich and deep',
        position: 'Front-middle of orchestra'
    },
    { 
        id: 4, 
        title: 'Double Bass', 
        family: 'Strings', 
        hint: 'Largest string instrument, very deep sound', 
        taboo: ['biggest', 'strings', 'low', 'stand', 'deepest'],
        soundMethod: 'Bowed or plucked strings vibrate',
        size: 'Largest (about 180cm)',
        sound: 'Very low and deep',
        position: 'Back of string section'
    },
    
    // WOODWINDS
    { 
        id: 5, 
        title: 'Flute', 
        family: 'Woodwind', 
        hint: 'Blow across a hole, made of metal', 
        taboo: ['blow', 'hole', 'silver', 'high', 'sideways'],
        soundMethod: 'Air vibrates across hole',
        size: 'Medium (about 67cm)',
        sound: 'High and clear',
        position: 'Middle of orchestra'
    },
    { 
        id: 6, 
        title: 'Piccolo', 
        family: 'Woodwind', 
        hint: 'Tiny flute, highest sound', 
        taboo: ['tiny', 'flute', 'high', 'small', 'shrill'],
        soundMethod: 'Air vibrates across hole',
        size: 'Smallest woodwind (about 32cm)',
        sound: 'Highest and piercing',
        position: 'Middle of orchestra'
    },
    { 
        id: 7, 
        title: 'Oboe', 
        family: 'Woodwind', 
        hint: 'Double reed, used to tune orchestra', 
        taboo: ['reed', 'double', 'tune', 'duck', 'skinny'],
        soundMethod: 'Double reed vibrates',
        size: 'Medium (about 66cm)',
        sound: 'Nasal and distinctive',
        position: 'Middle of orchestra'
    },
    { 
        id: 8, 
        title: 'Clarinet', 
        family: 'Woodwind', 
        hint: 'Single reed, black tube', 
        taboo: ['reed', 'black', 'single', 'squeeze', 'jazz'],
        soundMethod: 'Single reed vibrates',
        size: 'Medium (about 66cm)',
        sound: 'Smooth and mellow',
        position: 'Middle of orchestra'
    },
    { 
        id: 9, 
        title: 'Bassoon', 
        family: 'Woodwind', 
        hint: 'Large double reed, folded tube', 
        taboo: ['double', 'reed', 'long', 'low', 'folded'],
        soundMethod: 'Double reed vibrates',
        size: 'Large (about 135cm when unfolded)',
        sound: 'Deep and reedy',
        position: 'Middle-back of orchestra'
    },
    
    // BRASS
    { 
        id: 10, 
        title: 'Trumpet', 
        family: 'Brass', 
        hint: 'Three valves, bright and loud', 
        taboo: ['valves', 'brass', 'loud', 'jazz', 'shiny'],
        soundMethod: 'Lips buzz into mouthpiece',
        size: 'Medium (about 50cm)',
        sound: 'Bright and powerful',
        position: 'Back of orchestra'
    },
    { 
        id: 11, 
        title: 'French Horn', 
        family: 'Brass', 
        hint: 'Coiled tube, hand in bell', 
        taboo: ['circular', 'coiled', 'hand', 'round', 'mellow'],
        soundMethod: 'Lips buzz into mouthpiece',
        size: 'Large (coiled, about 3.5m when uncoiled)',
        sound: 'Warm and mellow',
        position: 'Back of orchestra'
    },
    { 
        id: 12, 
        title: 'Trombone', 
        family: 'Brass', 
        hint: 'Slide moves in and out', 
        taboo: ['slide', 'arm', 'long', 'low', 'brass'],
        soundMethod: 'Lips buzz, slide changes pitch',
        size: 'Large (about 270cm)',
        sound: 'Bold and strong',
        position: 'Back of orchestra'
    },
    { 
        id: 13, 
        title: 'Tuba', 
        family: 'Brass', 
        hint: 'Largest brass, very low sound', 
        taboo: ['biggest', 'brass', 'huge', 'low', 'heavy'],
        soundMethod: 'Lips buzz into large mouthpiece',
        size: 'Largest brass (about 110cm tall)',
        sound: 'Very low and deep',
        position: 'Back of orchestra'
    },
    
    // PERCUSSION
    { 
        id: 14, 
        title: 'Timpani', 
        family: 'Percussion', 
        hint: 'Large tuned drums, played with mallets', 
        taboo: ['drums', 'kettle', 'mallets', 'tuned', 'pedal'],
        soundMethod: 'Struck with mallets',
        size: 'Very large (60-80cm diameter)',
        sound: 'Deep and resonant',
        position: 'Back of orchestra'
    },
    { 
        id: 15, 
        title: 'Snare Drum', 
        family: 'Percussion', 
        hint: 'Drum with wires underneath', 
        taboo: ['wires', 'sticks', 'rattle', 'march', 'roll'],
        soundMethod: 'Struck with sticks, wires rattle',
        size: 'Medium (about 35cm diameter)',
        sound: 'Sharp and crisp',
        position: 'Back of orchestra'
    },
    { 
        id: 16, 
        title: 'Bass Drum', 
        family: 'Percussion', 
        hint: 'Largest drum, very deep boom', 
        taboo: ['biggest', 'boom', 'low', 'kick', 'huge'],
        soundMethod: 'Struck with large mallet',
        size: 'Very large (80-100cm diameter)',
        sound: 'Very low and booming',
        position: 'Back of orchestra'
    },
    { 
        id: 17, 
        title: 'Cymbals', 
        family: 'Percussion', 
        hint: 'Two metal plates crashed together', 
        taboo: ['crash', 'metal', 'two', 'loud', 'plates'],
        soundMethod: 'Two metal plates vibrate when crashed',
        size: 'Medium-large (40-60cm diameter)',
        sound: 'Bright and explosive',
        position: 'Back of orchestra'
    },
    { 
        id: 18, 
        title: 'Triangle', 
        family: 'Percussion', 
        hint: 'Three-sided metal, ding sound', 
        taboo: ['three', 'sides', 'metal', 'ding', 'stick'],
        soundMethod: 'Struck with metal beater',
        size: 'Small (15-20cm)',
        sound: 'High and clear',
        position: 'Back of orchestra'
    },
    { 
        id: 19, 
        title: 'Xylophone', 
        family: 'Percussion', 
        hint: 'Wooden bars, hit with mallets', 
        taboo: ['bars', 'wood', 'mallets', 'tuned', 'colourful'],
        soundMethod: 'Wooden bars vibrate when struck',
        size: 'Medium (about 120cm)',
        sound: 'Bright and percussive',
        position: 'Back of orchestra'
    },
    { 
        id: 20, 
        title: 'Harp', 
        family: 'Strings', 
        hint: 'Tall with many vertical strings', 
        taboo: ['strings', 'pluck', 'tall', 'angel', 'vertical'],
        soundMethod: 'Plucked strings vibrate',
        size: 'Very tall (about 180cm)',
        sound: 'Gentle and flowing',
        position: 'Middle-back of orchestra'
    }
];

// Musical vocabulary terms for 11 year olds
const DEFAULT_MUSICAL_VOCAB = [
    // TEMPO (Speed)
    { 
        id: 1, 
        title: 'Allegro', 
        family: 'Tempo', 
        hint: 'Fast and lively speed', 
        taboo: ['fast', 'quick', 'lively', 'speed', 'brisk'],
        soundMethod: 'Italian word meaning cheerful',
        size: 'Moderate to fast tempo',
        sound: 'Energetic and upbeat'
    },
    { 
        id: 2, 
        title: 'Adagio', 
        family: 'Tempo', 
        hint: 'Slow and gentle speed', 
        taboo: ['slow', 'gentle', 'calm', 'peaceful', 'relaxed'],
        soundMethod: 'Italian word meaning at ease',
        size: 'Slow tempo',
        sound: 'Calm and peaceful'
    },
    { 
        id: 3, 
        title: 'Andante', 
        family: 'Tempo', 
        hint: 'Walking pace, moderate speed', 
        taboo: ['walking', 'moderate', 'medium', 'pace', 'steady'],
        soundMethod: 'Italian word meaning walking',
        size: 'Moderate tempo',
        sound: 'Steady and flowing'
    },
    { 
        id: 4, 
        title: 'Presto', 
        family: 'Tempo', 
        hint: 'Very fast speed', 
        taboo: ['very', 'fast', 'quick', 'rapid', 'speedy'],
        soundMethod: 'Italian word meaning very fast',
        size: 'Very fast tempo',
        sound: 'Exciting and rapid'
    },
    { 
        id: 5, 
        title: 'Largo', 
        family: 'Tempo', 
        hint: 'Very slow and broad speed', 
        taboo: ['very', 'slow', 'broad', 'wide', 'stately'],
        soundMethod: 'Italian word meaning broad',
        size: 'Very slow tempo',
        sound: 'Grand and stately'
    },
    { 
        id: 6, 
        title: 'Moderato', 
        family: 'Tempo', 
        hint: 'Moderate, medium speed', 
        taboo: ['moderate', 'medium', 'average', 'normal', 'balanced'],
        soundMethod: 'Italian word meaning moderate',
        size: 'Medium tempo',
        sound: 'Balanced and steady'
    },
    
    // DYNAMICS (Volume)
    { 
        id: 7, 
        title: 'Forte', 
        family: 'Dynamics', 
        hint: 'Play loudly', 
        taboo: ['loud', 'strong', 'powerful', 'bold', 'f'],
        soundMethod: 'Italian word meaning strong',
        size: 'Loud volume',
        sound: 'Powerful and bold'
    },
    { 
        id: 8, 
        title: 'Piano', 
        family: 'Dynamics', 
        hint: 'Play quietly', 
        taboo: ['quiet', 'soft', 'gentle', 'peaceful', 'p'],
        soundMethod: 'Italian word meaning soft',
        size: 'Quiet volume',
        sound: 'Gentle and soft'
    },
    { 
        id: 9, 
        title: 'Crescendo', 
        family: 'Dynamics', 
        hint: 'Gradually get louder', 
        taboo: ['louder', 'increase', 'grow', 'build', 'up'],
        soundMethod: 'Italian word meaning growing',
        size: 'Volume increases',
        sound: 'Building intensity'
    },
    { 
        id: 10, 
        title: 'Diminuendo', 
        family: 'Dynamics', 
        hint: 'Gradually get quieter', 
        taboo: ['quieter', 'decrease', 'fade', 'dim', 'down'],
        soundMethod: 'Italian word meaning diminishing',
        size: 'Volume decreases',
        sound: 'Fading away'
    },
    { 
        id: 11, 
        title: 'Fortissimo', 
        family: 'Dynamics', 
        hint: 'Play very loudly', 
        taboo: ['very', 'loud', 'loudest', 'strongest', 'ff'],
        soundMethod: 'Italian word meaning very strong',
        size: 'Very loud volume',
        sound: 'Extremely powerful'
    },
    { 
        id: 12, 
        title: 'Pianissimo', 
        family: 'Dynamics', 
        hint: 'Play very quietly', 
        taboo: ['very', 'quiet', 'quietest', 'softest', 'pp'],
        soundMethod: 'Italian word meaning very soft',
        size: 'Very quiet volume',
        sound: 'Extremely gentle'
    },
    
    // EXPRESSION
    { 
        id: 13, 
        title: 'Staccato', 
        family: 'Expression', 
        hint: 'Short and detached notes', 
        taboo: ['short', 'detached', 'bouncy', 'dots', 'jumpy'],
        soundMethod: 'Italian word meaning detached',
        size: 'Short note length',
        sound: 'Crisp and bouncy'
    },
    { 
        id: 14, 
        title: 'Legato', 
        family: 'Expression', 
        hint: 'Smooth and connected notes', 
        taboo: ['smooth', 'connected', 'flowing', 'joined', 'slur'],
        soundMethod: 'Italian word meaning tied together',
        size: 'Long note length',
        sound: 'Smooth and flowing'
    },
    { 
        id: 15, 
        title: 'Accent', 
        family: 'Expression', 
        hint: 'Emphasise a note, make it stand out', 
        taboo: ['emphasise', 'stress', 'strong', 'punch', 'mark'],
        soundMethod: 'Marked with > symbol',
        size: 'Emphasised note',
        sound: 'Strong and prominent'
    },
    { 
        id: 16, 
        title: 'Fermata', 
        family: 'Expression', 
        hint: 'Hold a note longer than written', 
        taboo: ['hold', 'pause', 'stop', 'longer', 'pause'],
        soundMethod: 'Shown with a curved symbol',
        size: 'Extended note',
        sound: 'Sustained and held'
    },
    { 
        id: 17, 
        title: 'Ritardando', 
        family: 'Expression', 
        hint: 'Gradually slow down', 
        taboo: ['slow', 'down', 'gradually', 'decrease', 'rit'],
        soundMethod: 'Italian word meaning slowing',
        size: 'Tempo decreases',
        sound: 'Slowing down'
    },
    { 
        id: 18, 
        title: 'Accelerando', 
        family: 'Expression', 
        hint: 'Gradually speed up', 
        taboo: ['speed', 'up', 'gradually', 'increase', 'accel'],
        soundMethod: 'Italian word meaning accelerating',
        size: 'Tempo increases',
        sound: 'Speeding up'
    },
    
    // MUSICAL ELEMENTS
    { 
        id: 19, 
        title: 'Melody', 
        family: 'Musical Elements', 
        hint: 'The main tune you can sing', 
        taboo: ['tune', 'song', 'sing', 'main', 'line'],
        soundMethod: 'Sequence of notes',
        size: 'Horizontal line of music',
        sound: 'The memorable tune'
    },
    { 
        id: 20, 
        title: 'Harmony', 
        family: 'Musical Elements', 
        hint: 'Notes played together that sound good', 
        taboo: ['together', 'chord', 'blend', 'combine', 'agree'],
        soundMethod: 'Multiple notes at once',
        size: 'Vertical combination',
        sound: 'Pleasing combination'
    },
    { 
        id: 21, 
        title: 'Rhythm', 
        family: 'Musical Elements', 
        hint: 'Pattern of long and short sounds', 
        taboo: ['pattern', 'beat', 'timing', 'pulse', 'pattern'],
        soundMethod: 'Organisation of time',
        size: 'Pattern of durations',
        sound: 'The beat pattern'
    },
    { 
        id: 22, 
        title: 'Beat', 
        family: 'Musical Elements', 
        hint: 'The steady pulse you tap your foot to', 
        taboo: ['pulse', 'tap', 'steady', 'time', 'count'],
        soundMethod: 'Regular recurring pulse',
        size: 'Basic time unit',
        sound: 'Steady pulse'
    },
    { 
        id: 23, 
        title: 'Pitch', 
        family: 'Musical Elements', 
        hint: 'How high or low a note sounds', 
        taboo: ['high', 'low', 'note', 'tone', 'frequency'],
        soundMethod: 'Frequency of vibration',
        size: 'Vertical position',
        sound: 'High or low sound'
    },
    { 
        id: 24, 
        title: 'Scale', 
        family: 'Musical Elements', 
        hint: 'A series of notes going up or down', 
        taboo: ['series', 'notes', 'up', 'down', 'do-re-mi'],
        soundMethod: 'Pattern of intervals',
        size: 'Sequence of notes',
        sound: 'Musical ladder'
    }
];

// Ukulele chords for beginners
const DEFAULT_UKULELE_CHORDS = [
    { 
        id: 1, 
        title: 'C Chord', 
        family: 'Ukulele Chords', 
        hint: 'First finger on first fret of bottom string', 
        taboo: ['first', 'finger', 'fret', 'bottom', 'string'],
        soundMethod: 'Press strings with fingers',
        size: 'One finger chord',
        sound: 'Bright and happy'
    },
    { 
        id: 2, 
        title: 'G Chord', 
        family: 'Ukulele Chords', 
        hint: 'Three fingers, middle finger on second fret of top string', 
        taboo: ['three', 'fingers', 'second', 'fret', 'top'],
        soundMethod: 'Press strings with three fingers',
        size: 'Three finger chord',
        sound: 'Full and rich'
    },
    { 
        id: 3, 
        title: 'F Chord', 
        family: 'Ukulele Chords', 
        hint: 'Two fingers, first finger on first fret of second string', 
        taboo: ['two', 'fingers', 'first', 'fret', 'second'],
        soundMethod: 'Press strings with two fingers',
        size: 'Two finger chord',
        sound: 'Warm and mellow'
    },
    { 
        id: 4, 
        title: 'Am Chord', 
        family: 'Ukulele Chords', 
        hint: 'One finger on second fret of top string', 
        taboo: ['one', 'finger', 'second', 'fret', 'top'],
        soundMethod: 'Press string with one finger',
        size: 'One finger chord',
        sound: 'Sad and minor'
    },
    { 
        id: 5, 
        title: 'Em Chord', 
        family: 'Ukulele Chords', 
        hint: 'Three fingers, ring finger on fourth fret of top string', 
        taboo: ['three', 'fingers', 'fourth', 'fret', 'ring'],
        soundMethod: 'Press strings with three fingers',
        size: 'Three finger chord',
        sound: 'Gentle and minor'
    }
];

// Ukulele tab notation
const DEFAULT_UKULELE_TAB = [
    { 
        id: 1, 
        title: 'Tab Lines', 
        family: 'Ukulele Tab', 
        hint: 'Four horizontal lines representing strings', 
        taboo: ['four', 'lines', 'horizontal', 'strings', 'parallel'],
        soundMethod: 'Visual representation',
        size: 'Four lines',
        sound: 'Shows which strings to play'
    },
    { 
        id: 2, 
        title: 'Numbers on Tab', 
        family: 'Ukulele Tab', 
        hint: 'Numbers show which fret to press', 
        taboo: ['fret', 'press', 'number', 'position', 'finger'],
        soundMethod: 'Numbers indicate fret positions',
        size: 'Single digit numbers',
        sound: 'Tells you where to put fingers'
    },
    { 
        id: 3, 
        title: 'Zero on Tab', 
        family: 'Ukulele Tab', 
        hint: 'Zero means play the string open', 
        taboo: ['open', 'string', 'nothing', 'no', 'fret'],
        soundMethod: 'Play without pressing any fret',
        size: 'No finger needed',
        sound: 'Open string sound'
    },
    { 
        id: 4, 
        title: 'String Order', 
        family: 'Ukulele Tab', 
        hint: 'Top line is bottom string, bottom line is top string', 
        taboo: ['top', 'bottom', 'reverse', 'upside', 'down'],
        soundMethod: 'Tab is written upside down',
        size: 'Four strings',
        sound: 'Opposite to how you hold ukulele'
    },
    { 
        id: 5, 
        title: 'Reading Left to Right', 
        family: 'Ukulele Tab', 
        hint: 'Read tab from left to right like reading a book', 
        taboo: ['left', 'right', 'read', 'book', 'order'],
        soundMethod: 'Time moves from left to right',
        size: 'Horizontal reading',
        sound: 'Shows order of notes'
    },
    { 
        id: 6, 
        title: 'Multiple Numbers', 
        family: 'Ukulele Tab', 
        hint: 'Numbers stacked vertically mean play them together', 
        taboo: ['stacked', 'vertical', 'together', 'same', 'time'],
        soundMethod: 'Play all strings at once',
        size: 'Chord notation',
        sound: 'Multiple strings together'
    },
    { 
        id: 7, 
        title: 'Hammer On', 
        family: 'Ukulele Tab', 
        hint: 'Two numbers connected with h means hammer on', 
        taboo: ['h', 'connected', 'hammer', 'pull', 'off'],
        soundMethod: 'Press second note without plucking',
        size: 'Two numbers with h',
        sound: 'Smooth transition'
    },
    { 
        id: 8, 
        title: 'Pull Off', 
        family: 'Ukulele Tab', 
        hint: 'Two numbers connected with p means pull off', 
        taboo: ['p', 'connected', 'pull', 'hammer', 'off'],
        soundMethod: 'Lift finger to play lower note',
        size: 'Two numbers with p',
        sound: 'Smooth downward transition'
    }
];

// Recorder playing techniques and notes
const DEFAULT_RECORDER = [
    { 
        id: 1, 
        title: 'Good Breath', 
        family: 'Recorder Technique', 
        hint: 'Blow gently like fogging a mirror', 
        taboo: ['gently', 'soft', 'fog', 'mirror', 'warm'],
        soundMethod: 'Warm, gentle air',
        size: 'Steady breath',
        sound: 'Clear sound'
    },
    { 
        id: 2, 
        title: 'Cover Holes', 
        family: 'Recorder Technique', 
        hint: 'Fingers cover holes with pads', 
        taboo: ['cover', 'holes', 'pads', 'fingers', 'tips'],
        soundMethod: 'Use finger pads',
        size: 'All holes covered',
        sound: 'No leaks'
    },
    { 
        id: 3, 
        title: 'Left Hand Top', 
        family: 'Recorder Technique', 
        hint: 'Left hand on top, right hand below', 
        taboo: ['left', 'top', 'right', 'below', 'hand'],
        soundMethod: 'Left hand on top',
        size: 'Correct position',
        sound: 'Right way'
    },
    { 
        id: 4, 
        title: 'Thumb Hole', 
        family: 'Recorder Technique', 
        hint: 'Left thumb covers back hole', 
        taboo: ['thumb', 'back', 'hole', 'left', 'behind'],
        soundMethod: 'Thumb supports',
        size: 'One hole',
        sound: 'Stable'
    },
    { 
        id: 5, 
        title: 'Tongue Notes', 
        family: 'Recorder Technique', 
        hint: 'Say "too" to start each note', 
        taboo: ['tongue', 'too', 'start', 'say', 'doo'],
        soundMethod: 'Tongue starts note',
        size: 'One per note',
        sound: 'Clear start'
    },
    { 
        id: 6, 
        title: 'B Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb and first finger down', 
        taboo: ['thumb', 'first', 'finger', 'two', 'down'],
        soundMethod: 'Two holes',
        size: 'Two fingers',
        sound: 'Second note'
    },
    { 
        id: 7, 
        title: 'A Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb and two fingers down', 
        taboo: ['thumb', 'two', 'fingers', 'three', 'down'],
        soundMethod: 'Three holes',
        size: 'Three fingers',
        sound: 'Third note'
    },
    { 
        id: 8, 
        title: 'G Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb and three fingers down', 
        taboo: ['thumb', 'three', 'fingers', 'four', 'down'],
        soundMethod: 'Four holes',
        size: 'Four fingers',
        sound: 'First note'
    },
    { 
        id: 9, 
        title: 'C Note', 
        family: 'Recorder Notes', 
        hint: 'All left hand fingers down', 
        taboo: ['all', 'left', 'fingers', 'hand', 'five'],
        soundMethod: 'All left holes',
        size: 'Five fingers',
        sound: 'Lower note'
    },
    { 
        id: 10, 
        title: 'D Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb, first finger, right first finger', 
        taboo: ['thumb', 'first', 'right', 'finger', 'three'],
        soundMethod: 'Three holes',
        size: 'Three fingers',
        sound: 'Higher note'
    },
    { 
        id: 11, 
        title: 'E Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb, two fingers, right first finger', 
        taboo: ['thumb', 'two', 'right', 'finger', 'four'],
        soundMethod: 'Four holes',
        size: 'Four fingers',
        sound: 'Middle note'
    },
    { 
        id: 12, 
        title: 'F Note', 
        family: 'Recorder Notes', 
        hint: 'Thumb, first finger, right two fingers', 
        taboo: ['thumb', 'first', 'right', 'two', 'five'],
        soundMethod: 'Five holes',
        size: 'Five fingers',
        sound: 'Lower note'
    }
];

// Music Notes on the Staff
const DEFAULT_MUSIC_NOTES = [
    { 
        id: 1, 
        title: 'C Note', 
        family: 'Music Notes', 
        hint: 'First note, below the staff with a line', 
        taboo: ['first', 'below', 'staff', 'line', 'middle'],
        soundMethod: 'Low note',
        size: 'Below staff',
        sound: 'Low sound'
    },
    { 
        id: 2, 
        title: 'D Note', 
        family: 'Music Notes', 
        hint: 'Second note, on the first line', 
        taboo: ['second', 'first', 'line', 'bottom', 'low'],
        soundMethod: 'Low note',
        size: 'First line',
        sound: 'Low sound'
    },
    { 
        id: 3, 
        title: 'E Note', 
        family: 'Music Notes', 
        hint: 'Third note, in first space', 
        taboo: ['third', 'first', 'space', 'between', 'low'],
        soundMethod: 'Low note',
        size: 'First space',
        sound: 'Low sound'
    },
    { 
        id: 4, 
        title: 'F Note', 
        family: 'Music Notes', 
        hint: 'Fourth note, on second line', 
        taboo: ['fourth', 'second', 'line', 'middle', 'low'],
        soundMethod: 'Low note',
        size: 'Second line',
        sound: 'Low sound'
    },
    { 
        id: 5, 
        title: 'G Note', 
        family: 'Music Notes', 
        hint: 'Fifth note, in second space', 
        taboo: ['fifth', 'second', 'space', 'middle', 'treble'],
        soundMethod: 'Middle note',
        size: 'Second space',
        sound: 'Middle sound'
    },
    { 
        id: 6, 
        title: 'A Note', 
        family: 'Music Notes', 
        hint: 'Sixth note, on third line', 
        taboo: ['sixth', 'third', 'line', 'middle', 'high'],
        soundMethod: 'Middle note',
        size: 'Third line',
        sound: 'Middle sound'
    },
    { 
        id: 7, 
        title: 'B Note', 
        family: 'Music Notes', 
        hint: 'Seventh note, in third space', 
        taboo: ['seventh', 'third', 'space', 'high', 'top'],
        soundMethod: 'High note',
        size: 'Third space',
        sound: 'High sound'
    }
];

// Rhythm Patterns
const DEFAULT_RHYTHM_PATTERNS = [
    { 
        id: 1, 
        title: 'Ta', 
        family: 'Rhythm', 
        hint: 'One beat, say "ta"', 
        taboo: ['one', 'beat', 'quarter', 'ta', 'say'],
        soundMethod: 'One beat sound',
        size: 'One beat',
        sound: 'Short sound'
    },
    { 
        id: 2, 
        title: 'Ta-ah', 
        family: 'Rhythm', 
        hint: 'Two beats, say "ta-ah"', 
        taboo: ['two', 'beats', 'half', 'ta-ah', 'long'],
        soundMethod: 'Two beats sound',
        size: 'Two beats',
        sound: 'Long sound'
    },
    { 
        id: 3, 
        title: 'Ta-ah-ah-ah', 
        family: 'Rhythm', 
        hint: 'Four beats, say "ta-ah-ah-ah"', 
        taboo: ['four', 'beats', 'whole', 'ta-ah-ah-ah', 'longest'],
        soundMethod: 'Four beats sound',
        size: 'Four beats',
        sound: 'Longest sound'
    },
    { 
        id: 4, 
        title: 'Ti-ti', 
        family: 'Rhythm', 
        hint: 'Two short beats, say "ti-ti"', 
        taboo: ['two', 'short', 'eighth', 'ti-ti', 'quick'],
        soundMethod: 'Two quick beats',
        size: 'Two short beats',
        sound: 'Quick sound'
    },
    { 
        id: 5, 
        title: 'Rest', 
        family: 'Rhythm', 
        hint: 'Silence, no sound', 
        taboo: ['silence', 'no', 'sound', 'quiet', 'pause'],
        soundMethod: 'No sound',
        size: 'Silence',
        sound: 'Quiet'
    }
];

// Singing Techniques
const DEFAULT_SINGING = [
    { 
        id: 1, 
        title: 'Breathing', 
        family: 'Singing', 
        hint: 'Take deep breaths from your tummy', 
        taboo: ['deep', 'tummy', 'belly', 'breathe', 'air'],
        soundMethod: 'Deep belly breathing',
        size: 'Full breath',
        sound: 'Strong voice'
    },
    { 
        id: 2, 
        title: 'Posture', 
        family: 'Singing', 
        hint: 'Stand tall with shoulders back', 
        taboo: ['stand', 'tall', 'shoulders', 'back', 'straight'],
        soundMethod: 'Good body position',
        size: 'Upright',
        sound: 'Better sound'
    },
    { 
        id: 3, 
        title: 'Warm Up', 
        family: 'Singing', 
        hint: 'Practice scales before singing', 
        taboo: ['practice', 'scales', 'before', 'prepare', 'ready'],
        soundMethod: 'Prepare your voice',
        size: 'Short practice',
        sound: 'Ready voice'
    },
    { 
        id: 4, 
        title: 'Volume', 
        family: 'Singing', 
        hint: 'How loud or quiet you sing', 
        taboo: ['loud', 'quiet', 'soft', 'strong', 'level'],
        soundMethod: 'Control your voice',
        size: 'Loud or quiet',
        sound: 'Varied levels'
    },
    { 
        id: 5, 
        title: 'Pitch', 
        family: 'Singing', 
        hint: 'How high or low you sing', 
        taboo: ['high', 'low', 'tone', 'note', 'level'],
        soundMethod: 'Voice height',
        size: 'High or low',
        sound: 'Different tones'
    }
];

// Body Percussion
const DEFAULT_BODY_PERCUSSION = [
    { 
        id: 1, 
        title: 'Clap', 
        family: 'Body Percussion', 
        hint: 'Hit hands together', 
        taboo: ['hands', 'together', 'hit', 'strike', 'palm'],
        soundMethod: 'Hands together',
        size: 'Two hands',
        sound: 'Sharp sound'
    },
    { 
        id: 2, 
        title: 'Stamp', 
        family: 'Body Percussion', 
        hint: 'Hit foot on ground', 
        taboo: ['foot', 'ground', 'floor', 'hit', 'step'],
        soundMethod: 'Foot on floor',
        size: 'One foot',
        sound: 'Deep sound'
    },
    { 
        id: 3, 
        title: 'Tap', 
        family: 'Body Percussion', 
        hint: 'Light hit with fingers', 
        taboo: ['light', 'fingers', 'hit', 'gentle', 'soft'],
        soundMethod: 'Fingers tap',
        size: 'Fingers',
        sound: 'Light sound'
    },
    { 
        id: 4, 
        title: 'Pat', 
        family: 'Body Percussion', 
        hint: 'Hit legs with hands', 
        taboo: ['legs', 'hands', 'hit', 'thighs', 'lap'],
        soundMethod: 'Hands on legs',
        size: 'Hands and legs',
        sound: 'Muffled sound'
    },
    { 
        id: 5, 
        title: 'Click', 
        family: 'Body Percussion', 
        hint: 'Snap fingers together', 
        taboo: ['snap', 'fingers', 'thumb', 'middle', 'sharp'],
        soundMethod: 'Fingers snap',
        size: 'Two fingers',
        sound: 'Sharp click'
    }
];

// Music Symbols
const DEFAULT_MUSIC_SYMBOLS = [
    { 
        id: 1, 
        title: 'Treble Clef', 
        family: 'Music Symbols', 
        hint: 'Curly symbol for high notes', 
        taboo: ['curly', 'high', 'notes', 'g', 'clef'],
        soundMethod: 'Shows high notes',
        size: 'Decorative symbol',
        sound: 'High pitch'
    },
    { 
        id: 2, 
        title: 'Bass Clef', 
        family: 'Music Symbols', 
        hint: 'Symbol with dots for low notes', 
        taboo: ['dots', 'low', 'notes', 'f', 'clef'],
        soundMethod: 'Shows low notes',
        size: 'Symbol with dots',
        sound: 'Low pitch'
    },
    { 
        id: 3, 
        title: 'Sharp', 
        family: 'Music Symbols', 
        hint: 'Hash symbol raises note', 
        taboo: ['hash', 'raises', 'higher', 'pound', 'symbol'],
        soundMethod: 'Raises pitch',
        size: 'Hash symbol',
        sound: 'Higher note'
    },
    { 
        id: 4, 
        title: 'Flat', 
        family: 'Music Symbols', 
        hint: 'Lowercase b lowers note', 
        taboo: ['lowercase', 'b', 'lowers', 'lower', 'symbol'],
        soundMethod: 'Lowers pitch',
        size: 'B shape',
        sound: 'Lower note'
    },
    { 
        id: 5, 
        title: 'Natural', 
        family: 'Music Symbols', 
        hint: 'Square symbol cancels sharp or flat', 
        taboo: ['square', 'cancels', 'sharp', 'flat', 'normal'],
        soundMethod: 'Returns to natural',
        size: 'Square symbol',
        sound: 'Normal note'
    },
    { 
        id: 6, 
        title: 'Fermata', 
        family: 'Music Symbols', 
        hint: 'Curved symbol means hold longer', 
        taboo: ['curved', 'hold', 'longer', 'pause', 'stop'],
        soundMethod: 'Extends note',
        size: 'Curved symbol',
        sound: 'Longer note'
    }
];

// Music from Around the World
const DEFAULT_WORLD_MUSIC = [
    { 
        id: 1, 
        title: 'Samba', 
        family: 'World Music', 
        hint: 'Brazilian dance music with drums', 
        taboo: ['brazilian', 'dance', 'drums', 'carnival', 'latin'],
        soundMethod: 'Drums and percussion',
        size: 'Large groups',
        sound: 'Energetic and rhythmic'
    },
    { 
        id: 2, 
        title: 'Reggae', 
        family: 'World Music', 
        hint: 'Jamaican music with off-beat rhythm', 
        taboo: ['jamaican', 'off', 'beat', 'bob', 'marley'],
        soundMethod: 'Off-beat rhythm',
        size: 'Bands',
        sound: 'Relaxed and rhythmic'
    },
    { 
        id: 3, 
        title: 'Gamelan', 
        family: 'World Music', 
        hint: 'Indonesian music with metal instruments', 
        taboo: ['indonesian', 'metal', 'instruments', 'bali', 'gongs'],
        soundMethod: 'Metal instruments',
        size: 'Large ensembles',
        sound: 'Metallic and shimmering'
    },
    { 
        id: 4, 
        title: 'Flamenco', 
        family: 'World Music', 
        hint: 'Spanish music with guitar and clapping', 
        taboo: ['spanish', 'guitar', 'clapping', 'dance', 'hands'],
        soundMethod: 'Guitar and body percussion',
        size: 'Small groups',
        sound: 'Passionate and rhythmic'
    },
    { 
        id: 5, 
        title: 'Steel Drums', 
        family: 'World Music', 
        hint: 'Caribbean music with metal drums', 
        taboo: ['caribbean', 'metal', 'drums', 'trinidad', 'pans'],
        soundMethod: 'Metal drums',
        size: 'Steel pans',
        sound: 'Bright and cheerful'
    }
];

// Music and Emotions
const DEFAULT_MUSIC_EMOTIONS = [
    { 
        id: 1, 
        title: 'Happy Music', 
        family: 'Music Emotions', 
        hint: 'Fast and bright music', 
        taboo: ['fast', 'bright', 'cheerful', 'upbeat', 'joyful'],
        soundMethod: 'Major keys, fast tempo',
        size: 'Energetic',
        sound: 'Makes you smile'
    },
    { 
        id: 2, 
        title: 'Sad Music', 
        family: 'Music Emotions', 
        hint: 'Slow and gentle music', 
        taboo: ['slow', 'gentle', 'calm', 'peaceful', 'minor'],
        soundMethod: 'Minor keys, slow tempo',
        size: 'Calm',
        sound: 'Makes you feel quiet'
    },
    { 
        id: 3, 
        title: 'Exciting Music', 
        family: 'Music Emotions', 
        hint: 'Loud and fast music', 
        taboo: ['loud', 'fast', 'energetic', 'powerful', 'strong'],
        soundMethod: 'Loud dynamics, fast tempo',
        size: 'Powerful',
        sound: 'Makes your heart race'
    },
    { 
        id: 4, 
        title: 'Calm Music', 
        family: 'Music Emotions', 
        hint: 'Soft and slow music', 
        taboo: ['soft', 'slow', 'gentle', 'peaceful', 'quiet'],
        soundMethod: 'Soft dynamics, slow tempo',
        size: 'Gentle',
        sound: 'Makes you relax'
    },
    { 
        id: 5, 
        title: 'Scary Music', 
        family: 'Music Emotions', 
        hint: 'Low and mysterious music', 
        taboo: ['low', 'mysterious', 'dark', 'creepy', 'minor'],
        soundMethod: 'Low notes, minor keys',
        size: 'Dark',
        sound: 'Makes you feel nervous'
    }
];

// Music and Movement
const DEFAULT_MUSIC_MOVEMENT = [
    { 
        id: 1, 
        title: 'March', 
        family: 'Music Movement', 
        hint: 'Walk in time to music', 
        taboo: ['walk', 'time', 'beat', 'step', 'feet'],
        soundMethod: 'Steady beat',
        size: 'Walking pace',
        sound: 'Steady rhythm'
    },
    { 
        id: 2, 
        title: 'Skip', 
        family: 'Music Movement', 
        hint: 'Hop on one foot then the other', 
        taboo: ['hop', 'foot', 'bounce', 'jump', 'light'],
        soundMethod: 'Bouncy rhythm',
        size: 'Light steps',
        sound: 'Bouncy sound'
    },
    { 
        id: 3, 
        title: 'Gallop', 
        family: 'Music Movement', 
        hint: 'Run like a horse', 
        taboo: ['run', 'horse', 'fast', 'gallop', 'quick'],
        soundMethod: 'Fast rhythm',
        size: 'Running pace',
        sound: 'Fast sound'
    },
    { 
        id: 4, 
        title: 'Sway', 
        family: 'Music Movement', 
        hint: 'Move gently side to side', 
        taboo: ['gently', 'side', 'swing', 'smooth', 'slow'],
        soundMethod: 'Smooth rhythm',
        size: 'Gentle movement',
        sound: 'Smooth sound'
    },
    { 
        id: 5, 
        title: 'Freeze', 
        family: 'Music Movement', 
        hint: 'Stop moving when music stops', 
        taboo: ['stop', 'moving', 'still', 'pause', 'hold'],
        soundMethod: 'No movement',
        size: 'Still position',
        sound: 'Silence'
    }
];

// Simple Songs
const DEFAULT_SIMPLE_SONGS = [
    { 
        id: 1, 
        title: 'Twinkle Twinkle', 
        family: 'Simple Songs', 
        hint: 'Star song with same tune as ABC', 
        taboo: ['star', 'abc', 'little', 'diamond', 'sky'],
        soundMethod: 'Simple melody',
        size: 'Short song',
        sound: 'Gentle and familiar'
    },
    { 
        id: 2, 
        title: 'Happy Birthday', 
        family: 'Simple Songs', 
        hint: 'Song sung on birthdays', 
        taboo: ['birthday', 'cake', 'candles', 'celebrate', 'party'],
        soundMethod: 'Simple melody',
        size: 'Short song',
        sound: 'Celebratory'
    },
    { 
        id: 3, 
        title: 'Row Row Row Your Boat', 
        family: 'Simple Songs', 
        hint: 'Song about rowing a boat', 
        taboo: ['row', 'boat', 'water', 'stream', 'gently'],
        soundMethod: 'Round song',
        size: 'Short song',
        sound: 'Gentle and flowing'
    },
    { 
        id: 4, 
        title: 'London Bridge', 
        family: 'Simple Songs', 
        hint: 'Song about a bridge falling down', 
        taboo: ['bridge', 'falling', 'down', 'london', 'stone'],
        soundMethod: 'Game song',
        size: 'Short song',
        sound: 'Playful'
    },
    { 
        id: 5, 
        title: 'Old MacDonald', 
        family: 'Simple Songs', 
        hint: 'Song about a farm with animals', 
        taboo: ['farm', 'animals', 'cow', 'pig', 'e-i-e-i-o'],
        soundMethod: 'Repetitive song',
        size: 'Long song',
        sound: 'Fun and repetitive'
    }
];

// Instrument Sounds
const DEFAULT_INSTRUMENT_SOUNDS = [
    { 
        id: 1, 
        title: 'High Sound', 
        family: 'Instrument Sounds', 
        hint: 'Sound like a bird or whistle', 
        taboo: ['bird', 'whistle', 'small', 'tiny', 'squeaky'],
        soundMethod: 'Fast vibrations',
        size: 'Small instruments',
        sound: 'Sharp and clear'
    },
    { 
        id: 2, 
        title: 'Low Sound', 
        family: 'Instrument Sounds', 
        hint: 'Sound like a rumble or boom', 
        taboo: ['rumble', 'boom', 'big', 'large', 'deep'],
        soundMethod: 'Slow vibrations',
        size: 'Large instruments',
        sound: 'Deep and powerful'
    },
    { 
        id: 3, 
        title: 'Loud Sound', 
        taboo: ['strong', 'powerful', 'big', 'forceful', 'forte'],
        family: 'Instrument Sounds', 
        hint: 'Strong and powerful sound', 
        soundMethod: 'Strong vibrations',
        size: 'Any instrument',
        sound: 'Can be heard far away'
    },
    { 
        id: 4, 
        title: 'Quiet Sound', 
        family: 'Instrument Sounds', 
        hint: 'Soft and gentle sound', 
        taboo: ['soft', 'gentle', 'small', 'weak', 'piano'],
        soundMethod: 'Gentle vibrations',
        size: 'Any instrument',
        sound: 'Close to hear'
    },
    { 
        id: 5, 
        title: 'Smooth Sound', 
        family: 'Instrument Sounds', 
        hint: 'Flowing and connected sound', 
        taboo: ['flowing', 'connected', 'smooth', 'legato', 'joined'],
        soundMethod: 'Connected notes',
        size: 'Any instrument',
        sound: 'Flowing like water'
    },
    { 
        id: 6, 
        title: 'Bouncy Sound', 
        family: 'Instrument Sounds', 
        hint: 'Short and detached sound', 
        taboo: ['short', 'detached', 'bouncy', 'staccato', 'jumpy'],
        soundMethod: 'Separate notes',
        size: 'Any instrument',
        sound: 'Like bouncing ball'
    }
];

// Music in Stories
const DEFAULT_MUSIC_STORIES = [
    { 
        id: 1, 
        title: 'Soundtrack', 
        family: 'Music Stories', 
        hint: 'Music that goes with a film', 
        taboo: ['film', 'movie', 'background', 'accompany', 'video'],
        soundMethod: 'Matches the story',
        size: 'Full orchestra',
        sound: 'Enhances the story'
    },
    { 
        id: 2, 
        title: 'Theme Music', 
        family: 'Music Stories', 
        hint: 'Special tune for a character', 
        taboo: ['special', 'tune', 'character', 'person', 'recognise'],
        soundMethod: 'Repeated melody',
        size: 'Short tune',
        sound: 'Easy to remember'
    },
    { 
        id: 3, 
        title: 'Sound Effects', 
        family: 'Music Stories', 
        hint: 'Sounds like footsteps or doors', 
        taboo: ['footsteps', 'doors', 'sounds', 'effects', 'noise'],
        soundMethod: 'Real sounds',
        size: 'Various',
        sound: 'Makes story real'
    },
    { 
        id: 4, 
        title: 'Mood Music', 
        family: 'Music Stories', 
        hint: 'Music that shows feelings', 
        taboo: ['feelings', 'emotions', 'mood', 'atmosphere', 'feeling'],
        soundMethod: 'Matches emotion',
        size: 'Various',
        sound: 'Shows how to feel'
    },
    { 
        id: 5, 
        title: 'Action Music', 
        family: 'Music Stories', 
        hint: 'Fast music for exciting scenes', 
        taboo: ['fast', 'exciting', 'scenes', 'action', 'dramatic'],
        soundMethod: 'Fast and loud',
        size: 'Full orchestra',
        sound: 'Makes you excited'
    }
];

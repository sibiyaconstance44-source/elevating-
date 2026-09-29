export interface PhonicsCard {
  letter: string;
  sound: string; // phonetic explanation e.g. "/æ/ as in apple"
  exampleWord: string;
  emoji: string;
  category: 'vowel' | 'consonant' | 'digraph' | 'blend';
  soundClipText: string;
}

export interface CvcWord {
  word: string;
  onset: string;
  rime: string;
  meaning: string;
  emoji: string;
}

export interface ReadingPassage {
  id: string;
  grade: 'Grade R' | 'Grade 1' | 'Grade 2' | 'Grade 3';
  title: string;
  type: 'sentence' | 'paragraph';
  targetWordCount: number;
  expectedWpm: number;
  text: string;
  phonicsFocus: string[];
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

export interface EarlyMathProblem {
  id: string;
  grade: 'Grade R' | 'Grade 1' | 'Grade 2' | 'Grade 3';
  category: 'counting' | 'shapes' | 'addition' | 'subtraction' | 'money' | 'multiplication' | 'fractions' | 'time';
  prompt: string;
  visualItems?: { emoji: string; count: number }[];
  options: (string | number)[];
  correctAnswer: string | number;
  explanation: string;
  capsConcept: string;
}

export const FOUNDATION_GRADES = ['Grade R', 'Grade 1', 'Grade 2', 'Grade 3'] as const;
export type FoundationGrade = (typeof FOUNDATION_GRADES)[number];

export const GRADE_BENCHMARKS: Record<FoundationGrade, { targetWpm: string; description: string; focus: string }> = {
  'Grade R': {
    targetWpm: '10 - 20 WPM',
    description: 'Letter recognition, sound awareness, and short 3-4 word simple sentences.',
    focus: 'Single letter phonics, listening, pointing to words from left to right.',
  },
  'Grade 1': {
    targetWpm: '30 - 50 WPM',
    description: 'CVC words, high-frequency sight words, and decodable short sentences.',
    focus: 'Blending consonants and vowels, punctuation awareness (capital letters and full stops).',
  },
  'Grade 2': {
    targetWpm: '50 - 80 WPM',
    description: 'Digraphs (sh, ch, th), vowel teams, and short South African story paragraphs.',
    focus: 'Reading with expression, recognizing sight words instantly, reading for meaning.',
  },
  'Grade 3': {
    targetWpm: '80 - 110 WPM',
    description: 'Multi-syllable words, rich descriptive paragraphs, dialogue, and comprehension.',
    focus: 'Fluent oral reading, vocabulary inference, paragraph synthesis, and punctuation expression.',
  },
};

export const PHONICS_SOUNDS: Record<FoundationGrade, PhonicsCard[]> = {
  'Grade R': [
    { letter: 's', sound: '/s/ like a hissing snake', exampleWord: 'sun', emoji: '☀️', category: 'consonant', soundClipText: 's says ssss as in sun' },
    { letter: 'a', sound: '/æ/ like biting an apple', exampleWord: 'ant', emoji: '🐜', category: 'vowel', soundClipText: 'a says ah as in ant' },
    { letter: 't', sound: '/t/ like a ticking clock', exampleWord: 'tap', emoji: '🚰', category: 'consonant', soundClipText: 't says ttt as in tap' },
    { letter: 'p', sound: '/p/ popping popcorn', exampleWord: 'pan', emoji: '🍳', category: 'consonant', soundClipText: 'p says puh as in pan' },
    { letter: 'i', sound: '/ɪ/ like an itchy insect', exampleWord: 'ink', emoji: '🖋️', category: 'vowel', soundClipText: 'i says ih as in ink' },
    { letter: 'n', sound: '/n/ airplane engine', exampleWord: 'net', emoji: '🥅', category: 'consonant', soundClipText: 'n says nnn as in net' },
    { letter: 'm', sound: '/m/ yummy food sound', exampleWord: 'mat', emoji: '🧘', category: 'consonant', soundClipText: 'm says mmm as in mat' },
    { letter: 'd', sound: '/d/ drumming on a drum', exampleWord: 'dog', emoji: '🐶', category: 'consonant', soundClipText: 'd says duh as in dog' },
  ],
  'Grade 1': [
    { letter: 'b', sound: '/b/ bouncing ball', exampleWord: 'bat', emoji: '🏏', category: 'consonant', soundClipText: 'b says buh as in bat' },
    { letter: 'c', sound: '/k/ clicking camera', exampleWord: 'cat', emoji: '🐱', category: 'consonant', soundClipText: 'c says kuh as in cat' },
    { letter: 'o', sound: '/ɒ/ switching on a lamp', exampleWord: 'ox', emoji: '🐂', category: 'vowel', soundClipText: 'o says oh as in ox' },
    { letter: 'u', sound: '/ʌ/ opening an umbrella', exampleWord: 'up', emoji: '⬆️', category: 'vowel', soundClipText: 'u says uh as in up' },
    { letter: 'f', sound: '/f/ floating fish', exampleWord: 'fox', emoji: '🦊', category: 'consonant', soundClipText: 'f says fff as in fox' },
    { letter: 'l', sound: '/l/ licking a lollipop', exampleWord: 'leg', emoji: '🦵', category: 'consonant', soundClipText: 'l says lll as in leg' },
    { letter: 'st', sound: '/st/ blended blend', exampleWord: 'star', emoji: '⭐', category: 'blend', soundClipText: 's and t blend to make st as in star' },
    { letter: 'cl', sound: '/kl/ clapping hands', exampleWord: 'clap', emoji: '👏', category: 'blend', soundClipText: 'c and l blend to make cl as in clap' },
  ],
  'Grade 2': [
    { letter: 'sh', sound: '/ʃ/ quiet baby sound', exampleWord: 'ship', emoji: '🚢', category: 'digraph', soundClipText: 's and h make shhh as in ship' },
    { letter: 'ch', sound: '/tʃ/ choo-choo train', exampleWord: 'chin', emoji: '🧔', category: 'digraph', soundClipText: 'c and h make ch-ch as in chin' },
    { letter: 'th', sound: '/θ/ tongue between teeth', exampleWord: 'thin', emoji: '🧵', category: 'digraph', soundClipText: 't and h make thhh as in thin and Thandi' },
    { letter: 'wh', sound: '/w/ gentle wind blow', exampleWord: 'wheel', emoji: '🛞', category: 'digraph', soundClipText: 'w and h make wh as in wheel' },
    { letter: 'ee', sound: '/iː/ big smiling e', exampleWord: 'tree', emoji: '🌳', category: 'vowel', soundClipText: 'double e says eee as in tree' },
    { letter: 'oa', sound: '/oʊ/ floating on a boat', exampleWord: 'boat', emoji: '⛵', category: 'vowel', soundClipText: 'o and a say oh as in boat' },
    { letter: 'ai', sound: '/eɪ/ raindrops falling', exampleWord: 'rain', emoji: '🌧️', category: 'vowel', soundClipText: 'a and i say ay as in rain' },
  ],
  'Grade 3': [
    { letter: 'igh', sound: '/aɪ/ bright night light', exampleWord: 'night', emoji: '🌙', category: 'vowel', soundClipText: 'i-g-h together say eye as in night' },
    { letter: 'ou', sound: '/aʊ/ shouting loud out', exampleWord: 'cloud', emoji: '☁️', category: 'vowel', soundClipText: 'o and u say ow as in cloud' },
    { letter: 'oi', sound: '/ɔɪ/ bubbling boiling pot', exampleWord: 'coin', emoji: '🪙', category: 'vowel', soundClipText: 'o and i say oy as in coin' },
    { letter: 'kn', sound: '/n/ silent k sound', exampleWord: 'knee', emoji: '🦵', category: 'blend', soundClipText: 'k is silent, k-n says n as in knee' },
    { letter: 'ph', sound: '/f/ photo phone sound', exampleWord: 'phone', emoji: '📱', category: 'digraph', soundClipText: 'p and h say fff as in phone and Sipho' },
    { letter: 'ar', sound: '/ɑː/ pirate sound in car', exampleWord: 'star', emoji: '✨', category: 'blend', soundClipText: 'a and r say arr as in star' },
  ],
};

export const CVC_WORD_BUILDER_SETS: Record<FoundationGrade, CvcWord[]> = {
  'Grade R': [
    { word: 'cat', onset: 'c', rime: 'at', meaning: 'A friendly pet that purrs', emoji: '🐱' },
    { word: 'sat', onset: 's', rime: 'at', meaning: 'Rested on a chair or mat', emoji: '🪑' },
    { word: 'mat', onset: 'm', rime: 'at', meaning: 'A soft floor cover', emoji: '🧘' },
    { word: 'sun', onset: 's', rime: 'un', meaning: 'The bright star in the daytime sky', emoji: '☀️' },
    { word: 'run', onset: 'r', rime: 'un', meaning: 'Moving fast with your feet', emoji: '🏃' },
  ],
  'Grade 1': [
    { word: 'dog', onset: 'd', rime: 'og', meaning: 'A loyal animal that barks', emoji: '🐶' },
    { word: 'pig', onset: 'p', rime: 'ig', meaning: 'A pink animal on a farm', emoji: '🐷' },
    { word: 'bed', onset: 'b', rime: 'ed', meaning: 'Where we sleep at night', emoji: '🛏️' },
    { word: 'pen', onset: 'p', rime: 'en', meaning: 'A tool used to write with ink', emoji: '🖊️' },
    { word: 'fox', onset: 'f', rime: 'ox', meaning: 'A clever wild animal with an orange tail', emoji: '🦊' },
  ],
  'Grade 2': [
    { word: 'fish', onset: 'f', rime: 'ish', meaning: 'An animal that swims in water', emoji: '🐟' },
    { word: 'ship', onset: 'sh', rime: 'ip', meaning: 'A large boat sailing the ocean', emoji: '🚢' },
    { word: 'shop', onset: 'sh', rime: 'op', meaning: 'A store where we buy groceries', emoji: '🏪' },
    { word: 'chat', onset: 'ch', rime: 'at', meaning: 'Talking happily with a friend', emoji: '💬' },
    { word: 'tree', onset: 'tr', rime: 'ee', meaning: 'A tall plant with trunk and leaves', emoji: '🌳' },
  ],
  'Grade 3': [
    { word: 'bright', onset: 'br', rime: 'ight', meaning: 'Full of shining light', emoji: '💡' },
    { word: 'spring', onset: 'spr', rime: 'ing', meaning: 'A season when flowers bloom', emoji: '🌸' },
    { word: 'knight', onset: 'kn', rime: 'ight', meaning: 'A brave historic hero', emoji: '🛡️' },
    { word: 'proud', onset: 'pr', rime: 'oud', meaning: 'Feeling happy about an achievement', emoji: '🦁' },
  ],
};

export const READING_PASSAGES: Record<FoundationGrade, ReadingPassage[]> = {
  'Grade R': [
    {
      id: 'gr-r-read-1',
      grade: 'Grade R',
      title: 'The Big Cat',
      type: 'sentence',
      targetWordCount: 5,
      expectedWpm: 15,
      text: 'I see a big cat.',
      phonicsFocus: ['c', 'a', 't', 'b', 'i', 'g'],
      comprehensionQuestion: {
        question: 'What do I see?',
        options: ['A big cat', 'A small dog', 'A blue bird'],
        correctIndex: 0,
      },
    },
    {
      id: 'gr-r-read-2',
      grade: 'Grade R',
      title: 'The Hot Sun',
      type: 'sentence',
      targetWordCount: 5,
      expectedWpm: 15,
      text: 'The warm sun is hot.',
      phonicsFocus: ['s', 'u', 'n', 'h', 'o', 't'],
      comprehensionQuestion: {
        question: 'How is the sun?',
        options: ['Cold and wet', 'Warm and hot', 'Dark and green'],
        correctIndex: 1,
      },
    },
    {
      id: 'gr-r-read-3',
      grade: 'Grade R',
      title: 'Sam and His Hat',
      type: 'sentence',
      targetWordCount: 6,
      expectedWpm: 16,
      text: 'Sam has a bright red hat.',
      phonicsFocus: ['s', 'a', 'm', 'h', 'a', 't', 'r', 'e', 'd'],
      comprehensionQuestion: {
        question: 'What color is Sam’s hat?',
        options: ['Blue', 'Green', 'Red'],
        correctIndex: 2,
      },
    },
  ],
  'Grade 1': [
    {
      id: 'gr-1-read-1',
      grade: 'Grade 1',
      title: 'The Dog in the Sun',
      type: 'paragraph',
      targetWordCount: 16,
      expectedWpm: 35,
      text: 'The dog and the cat sat in the warm sun. They took a good nap on the soft mat.',
      phonicsFocus: ['d-o-g', 'c-a-t', 's-a-t', 's-u-n', 'n-a-p', 'm-a-t'],
      comprehensionQuestion: {
        question: 'Where did the dog and cat nap?',
        options: ['In the car', 'On the soft mat', 'Under a rock'],
        correctIndex: 1,
      },
    },
    {
      id: 'gr-1-read-2',
      grade: 'Grade 1',
      title: 'Lindi and Her Brown Pup',
      type: 'paragraph',
      targetWordCount: 18,
      expectedWpm: 38,
      text: 'Lindi has a little brown pup. The pup likes to run on the green grass and jump very high.',
      phonicsFocus: ['p-u-p', 'r-u-n', 'h-i-g-h', 'g-r-a-s-s'],
      comprehensionQuestion: {
        question: 'What does Lindi’s pup like to do?',
        options: ['Run on grass and jump', 'Sleep all day', 'Swim in a pool'],
        correctIndex: 0,
      },
    },
    {
      id: 'gr-1-read-3',
      grade: 'Grade 1',
      title: 'Going to the Farm',
      type: 'paragraph',
      targetWordCount: 19,
      expectedWpm: 40,
      text: 'Bongani went to visit his gogo on the farm. He saw six fat hens and one red rooster.',
      phonicsFocus: ['f-a-r-m', 'h-e-n-s', 'v-i-s-i-t', 'r-e-d'],
      comprehensionQuestion: {
        question: 'Who did Bongani visit on the farm?',
        options: ['His uncle', 'His gogo (grandmother)', 'His teacher'],
        correctIndex: 1,
      },
    },
  ],
  'Grade 2': [
    {
      id: 'gr-2-read-1',
      grade: 'Grade 2',
      title: 'Trip to the Kruger Safari',
      type: 'paragraph',
      targetWordCount: 38,
      expectedWpm: 60,
      text: 'Thandi and her brother Sipho visited the Kruger National Park with their granny. They saw a tall giraffe eating leaves from an acacia tree. Two zebras drank clean water at the dam. Sipho smiled and waved to the rangers.',
      phonicsFocus: ['th (Thandi, their)', 'ph (Sipho)', 'ee (tree)', 'ea (leaves, clean)'],
      comprehensionQuestion: {
        question: 'What animal was eating leaves from the acacia tree?',
        options: ['A lion', 'A tall giraffe', 'An elephant'],
        correctIndex: 1,
      },
    },
    {
      id: 'gr-2-read-2',
      grade: 'Grade 2',
      title: 'The Little Green Garden',
      type: 'paragraph',
      targetWordCount: 36,
      expectedWpm: 62,
      text: 'Every afternoon, Khensani helps water the spinach and pumpkin plants in her school garden. The soil is rich and dark. Soon, the fresh vegetables will be ready for the family to eat together at dinner.',
      phonicsFocus: ['sh (spinach, fresh)', 'ch (rich)', 'oo (school)', 'ea (ready, eat)'],
      comprehensionQuestion: {
        question: 'What does Khensani water in the school garden?',
        options: ['Spinach and pumpkin plants', 'Rose flowers only', 'Sweet apples'],
        correctIndex: 0,
      },
    },
  ],
  'Grade 3': [
    {
      id: 'gr-3-read-1',
      grade: 'Grade 3',
      title: 'The Blue Ocean at Boulders Beach',
      type: 'paragraph',
      targetWordCount: 52,
      expectedWpm: 90,
      text: 'One bright Saturday morning, Zola and her family travelled to Boulders Beach near Cape Town. The cool ocean breeze blew through the trees. Down on the white sand, small African penguins waddled happily between the rocks. Zola took out her sketchpad and drew a colourful picture of the mother penguin protecting her nest.',
      phonicsFocus: ['igh (bright)', 'ou (Boulders, out)', 'ew (blew, drew)', 'wh (white)'],
      comprehensionQuestion: {
        question: 'What kind of penguins did Zola see on the sand?',
        options: ['Emperor penguins', 'African penguins', 'King penguins'],
        correctIndex: 1,
      },
    },
    {
      id: 'gr-3-read-2',
      grade: 'Grade 3',
      title: 'Reading Day at Nelson Mandela Primary',
      type: 'paragraph',
      targetWordCount: 54,
      expectedWpm: 95,
      text: 'It was National Reading Week at Nelson Mandela Primary School. In the library, colourful books were arranged neatly on wooden shelves. Mrs Khumalo invited learners to choose a storybook and read aloud to their classmates. Jabulani stood up tall, took a deep breath, and read his adventure tale with a clear and confident voice.',
      phonicsFocus: ['kn/wr (wooden, written)', 'oo (books, wooden)', 'ee (Week, deep)', 'ar (arranged, clear)'],
      comprehensionQuestion: {
        question: 'How did Jabulani read his adventure tale to the class?',
        options: ['In a quiet whisper', 'With a clear and confident voice', 'He did not want to read'],
        correctIndex: 1,
      },
    },
  ],
};

export const EARLY_MATH_CHALLENGES: Record<FoundationGrade, EarlyMathProblem[]> = {
  'Grade R': [
    {
      id: 'math-r-1',
      grade: 'Grade R',
      category: 'counting',
      prompt: 'How many juicy red apples can you count?',
      visualItems: [{ emoji: '🍎', count: 4 }],
      options: [3, 4, 5, 6],
      correctAnswer: 4,
      explanation: 'Let us count them together: 1, 2, 3, 4! There are 4 apples.',
      capsConcept: 'Number recognition and counting objects 1 to 10',
    },
    {
      id: 'math-r-2',
      grade: 'Grade R',
      category: 'shapes',
      prompt: 'Which shape has 3 sides and 3 corners?',
      options: ['Triangle 🔺', 'Circle 🔴', 'Square 🟦', 'Star ⭐'],
      correctAnswer: 'Triangle 🔺',
      explanation: 'A triangle has 3 straight sides and 3 pointy corners!',
      capsConcept: '2D Shapes and geometric identification',
    },
    {
      id: 'math-r-3',
      grade: 'Grade R',
      category: 'counting',
      prompt: 'Count the friendly yellow lions:',
      visualItems: [{ emoji: '🦁', count: 3 }],
      options: [2, 3, 4, 5],
      correctAnswer: 3,
      explanation: 'One, two, three lions! ROAR! 🦁',
      capsConcept: 'Counting animals 1 to 5',
    },
  ],
  'Grade 1': [
    {
      id: 'math-1-1',
      grade: 'Grade 1',
      category: 'addition',
      prompt: 'Thabo has 5 marbles. His friend gives him 4 more marbles. How many marbles does Thabo have in total? (5 + 4 = ?)',
      visualItems: [
        { emoji: '🔵', count: 5 },
        { emoji: '🟢', count: 4 },
      ],
      options: [8, 9, 10, 11],
      correctAnswer: 9,
      explanation: '5 + 4 = 9. You can start at 5 and count on 4 steps: 6, 7, 8, 9!',
      capsConcept: 'Addition with totals up to 20',
    },
    {
      id: 'math-1-2',
      grade: 'Grade 1',
      category: 'subtraction',
      prompt: 'There are 10 birds on a branch. 3 birds fly away into the sky. How many birds are left? (10 - 3 = ?)',
      visualItems: [{ emoji: '🐦', count: 10 }],
      options: [6, 7, 8, 9],
      correctAnswer: 7,
      explanation: '10 take away 3 leaves 7 birds! 10 - 3 = 7.',
      capsConcept: 'Number bonds to 10 and subtraction',
    },
    {
      id: 'math-1-3',
      grade: 'Grade 1',
      category: 'counting',
      prompt: 'Skip count by 2s: 2, 4, 6, 8, ___? What number comes next?',
      options: [9, 10, 11, 12],
      correctAnswer: 10,
      explanation: 'Counting in twos: 2, 4, 6, 8, and next is 10!',
      capsConcept: 'Skip counting in 2s up to 20',
    },
  ],
  'Grade 2': [
    {
      id: 'math-2-1',
      grade: 'Grade 2',
      category: 'money',
      prompt: 'South African Money: Sipho has one R5 coin and two R2 coins. How much money does Sipho have altogether?',
      visualItems: [
        { emoji: '🪙 R5', count: 1 },
        { emoji: '🪙 R2', count: 2 },
      ],
      options: ['R7', 'R8', 'R9', 'R10'],
      correctAnswer: 'R9',
      explanation: 'R5 + R2 + R2 = R9. Sipho has R9 in South African currency!',
      capsConcept: 'Money: South African Rand coins and simple calculations',
    },
    {
      id: 'math-2-2',
      grade: 'Grade 2',
      category: 'multiplication',
      prompt: 'There are 4 bicycles in the school yard. Each bicycle has 2 wheels. How many wheels are there in total? (4 × 2 = ?)',
      options: [6, 8, 10, 12],
      correctAnswer: 8,
      explanation: '4 groups of 2 wheels = 4 × 2 = 8 wheels!',
      capsConcept: 'Repeated addition and 2x multiplication',
    },
    {
      id: 'math-2-3',
      grade: 'Grade 2',
      category: 'addition',
      prompt: 'Mentally calculate: 25 + 15 = ?',
      options: [35, 40, 45, 50],
      correctAnswer: 40,
      explanation: '25 + 10 = 35, plus 5 more = 40! 25 + 15 = 40.',
      capsConcept: 'Addition of 2-digit numbers up to 100',
    },
  ],
  'Grade 3': [
    {
      id: 'math-3-1',
      grade: 'Grade 3',
      category: 'fractions',
      prompt: 'A round pizza is cut into 4 equal slices. Nomsa eats 1 slice. What fraction of the pizza did Nomsa eat?',
      visualItems: [{ emoji: '🍕', count: 4 }],
      options: ['1/2 (Half)', '1/4 (One quarter)', '3/4 (Three quarters)', '1/3 (One third)'],
      correctAnswer: '1/4 (One quarter)',
      explanation: '1 out of 4 equal pieces is written as 1/4 (one quarter)!',
      capsConcept: 'Fractions as equal parts of a whole (halves, quarters, thirds)',
    },
    {
      id: 'math-3-2',
      grade: 'Grade 3',
      category: 'multiplication',
      prompt: 'A bakery packs cupcakes into boxes of 6. If they have 5 boxes, how many cupcakes are there? (5 × 6 = ?)',
      options: [24, 30, 35, 36],
      correctAnswer: 30,
      explanation: '5 boxes × 6 cupcakes = 30 cupcakes in total!',
      capsConcept: 'Multiplication tables: 3x, 4x, 5x, 6x',
    },
    {
      id: 'math-3-3',
      grade: 'Grade 3',
      category: 'time',
      prompt: 'The clock shows that the long hand is pointing at 6, and the short hand is between 2 and 3. What time is it?',
      options: ['Half past 2 (02:30)', 'Half past 3 (03:30)', 'Quarter past 2 (02:15)', '2 o\'clock (02:00)'],
      correctAnswer: 'Half past 2 (02:30)',
      explanation: 'When the minute hand points to 6, 30 minutes have passed. It is half past 2 (02:30)!',
      capsConcept: 'Telling time on 12-hour analog and digital clocks',
    },
  ],
};

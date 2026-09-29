import { PracticeDifficulty } from '../types';
import { LESSONS, SUBJECTS } from './curriculum';

export interface PracticeQuestion {
  id: string;
  subjectId: string;
  difficulty: PracticeDifficulty;
  gradeLevel?: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examTip: string;
  bloomsLevel: 'Level 1: Knowledge' | 'Level 2: Routine' | 'Level 3: Complex Application' | 'Level 4: Problem Solving & Analysis';
}

export const CURATED_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // --- MATHEMATICS (FET) ---
  {
    id: 'pq-math-f-1',
    subjectId: '1012-math',
    difficulty: 'foundation',
    topic: 'Algebra & Quadratic Equations',
    question: 'Solve for x: x² - 5x + 6 = 0',
    options: ['x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 6', 'x = -1 or x = -6'],
    correctIndex: 0,
    explanation: 'Factorise the quadratic: (x - 2)(x - 3) = 0. Therefore x - 2 = 0 => x = 2, or x - 3 = 0 => x = 3.',
    examTip: 'Always check your factors by expanding back before finalizing your answer in Paper 1 Question 1.',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-math-f-2',
    subjectId: '1012-math',
    difficulty: 'foundation',
    topic: 'Sequences & Series',
    question: 'Find the 10th term of the arithmetic sequence: 3; 7; 11; 15; ...',
    options: ['39', '43', '35', '47'],
    correctIndex: 0,
    explanation: 'First term a = 3, common difference d = 7 - 3 = 4. Formula: Tn = a + (n - 1)d. T10 = 3 + (10 - 1)(4) = 3 + 36 = 39.',
    examTip: 'Check if the difference is constant before using Tn = a + (n-1)d.',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-math-i-1',
    subjectId: '1012-math',
    difficulty: 'intermediate',
    topic: 'Differential Calculus',
    question: 'Determine the derivative f\'(x) for f(x) = 3x³ - 5x² + 4x - 7.',
    options: ['9x² - 10x + 4', '9x² - 5x + 4', '3x² - 10x + 4', '9x³ - 10x² + 4x'],
    correctIndex: 0,
    explanation: 'Apply the power rule d/dx [ax^n] = n·a·x^(n-1): d/dx(3x³) = 9x², d/dx(-5x²) = -10x, d/dx(4x) = 4, and d/dx(-7) = 0. Total f\'(x) = 9x² - 10x + 4.',
    examTip: 'Constants differentiate to 0. Do not leave the -7 or write -7x.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-math-i-2',
    subjectId: '1012-math',
    difficulty: 'intermediate',
    topic: 'Financial Mathematics',
    question: 'An investment of R15,000 earns interest at 9% p.a. compounded monthly for 4 years. What is the total accumulated amount?',
    options: ['R21,471.05', 'R20,400.00', 'R19,550.80', 'R22,890.12'],
    correctIndex: 0,
    explanation: 'Use A = P(1 + i/m)^(n·m). P = 15000, i = 0.09, m = 12, n = 4 years. n·m = 48 periods. A = 15000(1 + 0.09/12)^48 = 15000(1.0075)^48 ≈ R21,471.05.',
    examTip: 'Always convert annual rate to monthly by dividing by 12, and multiply years by 12 for compounding periods.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-math-a-1',
    subjectId: '1012-math',
    difficulty: 'advanced',
    topic: 'Trigonometry & General Solutions',
    question: 'Determine the general solution for: 2 sin²(x) - sin(x) - 1 = 0',
    options: [
      'x = 90° + k·360° or x = 210° + k·360° or x = 330° + k·360° (k ∈ ℤ)',
      'x = 45° + k·360° or x = 135° + k·360° (k ∈ ℤ)',
      'x = 30° + k·360° or x = 150° + k·360° (k ∈ ℤ)',
      'x = 90° + k·180° (k ∈ ℤ)'
    ],
    correctIndex: 0,
    explanation: 'Let u = sin(x): 2u² - u - 1 = 0 => (2u + 1)(u - 1) = 0. So u = 1 or u = -1/2. Case 1: sin(x) = 1 => x = 90° + k·360°. Case 2: sin(x) = -1/2 (quadrants 3 & 4) => x = 180° + 30° = 210° + k·360°, and x = 360° - 30° = 330° + k·360° (k ∈ ℤ).',
    examTip: 'Do not forget k ∈ ℤ! In the DBE marking guidelines, failing to state k ∈ ℤ loses 1 mark.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },
  {
    id: 'pq-math-a-2',
    subjectId: '1012-math',
    difficulty: 'advanced',
    topic: 'Euclidean Geometry',
    question: 'In circle O, chord AB is equal in length to radius OA. A tangent is drawn at point B. What is the angle between chord AB and the tangent at B?',
    options: ['30°', '60°', '45°', '90°'],
    correctIndex: 0,
    explanation: 'Since OA = OB = radius and chord AB = radius, triangle OAB is equilateral! Therefore, angle AOB = angle OAB = angle OBA = 60°. The tangent at B is perpendicular to radius OB (90°). Thus, angle between AB and tangent = 90° - 60° = 30° (or by tan-chord theorem subtending 60° at center so 30° at circumference).',
    examTip: 'Sketch the circle and use the Tan-Chord Theorem or Radius-Tangent perpendicularity rule.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- PHYSICAL SCIENCES ---
  {
    id: 'pq-phys-f-1',
    subjectId: '1012-phys',
    difficulty: 'foundation',
    topic: 'Newton\'s Laws',
    question: 'Which of Newton\'s laws states: "When object A exerts a force on object B, object B simultaneously exerts an equal and opposite force on object A"?',
    options: ['Newton\'s Third Law', 'Newton\'s First Law', 'Newton\'s Second Law', 'Universal Law of Gravitation'],
    correctIndex: 0,
    explanation: 'This is the exact CAPS definition of Newton\'s Third Law of Motion (action-reaction pairs act on different objects).',
    examTip: 'Remember: action-reaction pairs NEVER cancel each other out because they act on TWO DIFFERENT bodies.',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-phys-i-1',
    subjectId: '1012-phys',
    difficulty: 'intermediate',
    topic: 'Work, Energy & Power',
    question: 'A crate of mass 20 kg is pulled 10 m across a rough floor by a horizontal force of 80 N. If the friction force is 30 N, calculate the net work done on the crate.',
    options: ['500 J', '800 J', '300 J', '1100 J'],
    correctIndex: 0,
    explanation: 'Fnet = Fapplied - Ffriction = 80 N - 30 N = 50 N. Wnet = Fnet · Δx · cos(0°) = 50 N × 10 m = 500 J.',
    examTip: 'Wnet = ΔEk (Work-Energy Theorem). You can also do Wapplied (800J) - Wfriction (300J) = 500J.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-phys-a-1',
    subjectId: '1012-phys',
    difficulty: 'advanced',
    topic: 'Doppler Effect & Electrodynamics',
    question: 'An ambulance siren emits sound at frequency fs = 800 Hz. The ambulance approaches a stationary listener at 25 m/s. (Speed of sound in air = 340 m/s). What frequency does the listener observe?',
    options: ['863.49 Hz', '745.21 Hz', '825.00 Hz', '900.00 Hz'],
    correctIndex: 0,
    explanation: 'Formula: fL = [v / (v - vs)] × fs when the source approaches. fL = [340 / (340 - 25)] × 800 = [340 / 315] × 800 ≈ 863.49 Hz.',
    examTip: 'As source approaches, the denominator must be smaller (v - vs) so the observed pitch is HIGHER.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },
  {
    id: 'pq-phys-a-2',
    subjectId: '1012-phys',
    difficulty: 'advanced',
    topic: 'Organic Chemistry & Esters',
    question: 'Name the ester formed by the acid-catalysed condensation reaction between ethanoic acid and propan-1-ol.',
    options: ['Propyl ethanoate', 'Ethyl propanoate', 'Methyl butanoate', 'Propyl methanoate'],
    correctIndex: 0,
    explanation: 'The alkyl group from the alcohol comes first: propanol becomes "propyl". The carboxylate from the carboxylic acid comes second: ethanoic acid becomes "ethanoate". Result: Propyl ethanoate + H2O.',
    examTip: 'Alcohol provides the alkyl prefix (-yl), acid provides the suffix (-oate). Concentrated H2SO4 is the dehydrating catalyst.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- LIFE SCIENCES ---
  {
    id: 'pq-life-f-1',
    subjectId: '1012-life',
    difficulty: 'foundation',
    topic: 'DNA Code of Life',
    question: 'In a double-stranded DNA molecule, which nitrogenous base always pairs with Adenine (A)?',
    options: ['Thymine (T)', 'Cytosine (C)', 'Guanine (G)', 'Uracil (U)'],
    correctIndex: 0,
    explanation: 'By Chargaff\'s base-pairing rules in DNA: Adenine (A) pairs with Thymine (T) via two hydrogen bonds. (Uracil replaces Thymine only in RNA).',
    examTip: 'Remember the mnemonic: "Apples on Trees (A-T), Cars in Garages (C-G)".',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-life-i-1',
    subjectId: '1012-life',
    difficulty: 'intermediate',
    topic: 'Genetics & Monohybrid Cross',
    question: 'In pea plants, tall (T) is dominant over short (t). If two heterozygous tall plants (Tt × Tt) are crossed, what is the expected phenotypic ratio of the offspring?',
    options: ['3 tall : 1 short', '1 tall : 2 medium : 1 short', '1 tall : 1 short', 'All tall'],
    correctIndex: 0,
    explanation: 'Punnett square of Tt × Tt gives genotypes: 1 TT : 2 Tt : 1 tt. Both TT and Tt show the dominant tall phenotype. Hence, 3 tall : 1 short (75% tall, 25% short).',
    examTip: 'Check whether the question asks for the PHENOTYPIC ratio (3:1) or GENOTYPIC ratio (1:2:1).',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-life-a-1',
    subjectId: '1012-life',
    difficulty: 'advanced',
    topic: 'Homeostasis & Endocrine System',
    question: 'A learner drinks 1 liter of pure water quickly. Describe the homeostatic response of the pituitary gland and kidneys to restore water balance.',
    options: [
      'Pituitary releases LESS ADH → distal tubule becomes LESS permeable → MORE dilute urine excreted',
      'Pituitary releases MORE ADH → distal tubule becomes MORE permeable → LESS urine excreted',
      'Adrenal gland releases aldosterone → kidneys reabsorb more water and salt',
      'Insulin increases water absorption in the loop of Henle'
    ],
    correctIndex: 0,
    explanation: 'Excess water lowers blood osmolarity. Hypothalamus detects this and instructs the pituitary to secrete LESS ADH. Less ADH makes the collecting duct less permeable to water, so less water is reabsorbed back into the blood, producing large volumes of dilute urine.',
    examTip: 'Negative feedback: high blood water -> decrease ADH -> increase urine output.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- MATHEMATICAL LITERACY ---
  {
    id: 'pq-mlit-f-1',
    subjectId: '1012-mathlit',
    difficulty: 'foundation',
    topic: 'Finance & VAT',
    question: 'A pair of school shoes costs R400.00 excluding 15% VAT. Calculate the total price including VAT.',
    options: ['R460.00', 'R415.00', 'R450.00', 'R480.00'],
    correctIndex: 0,
    explanation: 'VAT = 15% of R400 = 0.15 × 400 = R60. Price incl. VAT = R400 + R60 = R460.00.',
    examTip: 'To calculate VAT inclusive price directly, multiply by 1.15.',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-mlit-i-1',
    subjectId: '1012-mathlit',
    difficulty: 'intermediate',
    topic: 'Measurements & Perimeter',
    question: 'A soccer pitch measures 105 m in length and 68 m in width. How much white chalk line is needed to mark the outer boundary perimeter?',
    options: ['346 m', '173 m', '7,140 m', '208 m'],
    correctIndex: 0,
    explanation: 'Perimeter of rectangle = 2(length + width) = 2(105 + 68) = 2(173) = 346 meters.',
    examTip: 'Don\'t confuse perimeter (distance around the edge, in meters) with area (m²).',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-mlit-a-1',
    subjectId: '1012-mathlit',
    difficulty: 'advanced',
    topic: 'Tariffs & Step Billing',
    question: 'Municipal water tariff: 0-6 kL = Free; 7-15 kL = R15.50/kL; 16-30 kL = R24.00/kL. If a household uses 22 kL in a month, what is the water charge (excl. VAT)?',
    options: ['R307.50', 'R528.00', 'R341.00', 'R285.00'],
    correctIndex: 0,
    explanation: 'Step 1 (0-6 kL): 6 kL × R0 = R0. Step 2 (7-15 kL = 9 kL): 9 × R15.50 = R139.50. Step 3 (16-22 kL = 7 kL): 7 × R24.00 = R168.00. Total = R0 + R139.50 + R168.00 = R307.50.',
    examTip: 'Sliding scale tariffs: calculate each tier separately and add them up. Never multiply the entire 22 kL by the highest rate!',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- ACCOUNTING ---
  {
    id: 'pq-acc-f-1',
    subjectId: '1012-acc',
    difficulty: 'foundation',
    topic: 'Accounting Equation',
    question: 'Which of the following correctly states the fundamental South African accounting equation?',
    options: ['Assets = Owner\'s Equity + Liabilities', 'Liabilities = Assets + Owner\'s Equity', 'Owner\'s Equity = Assets + Liabilities', 'Assets = Revenue - Expenses'],
    correctIndex: 0,
    explanation: 'The fundamental equation is A = OE + L (Assets = Owner\'s Equity + Liabilities).',
    examTip: 'Remember: Debit increases Assets and Expenses, Credit increases Equity, Liabilities, and Income.',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-acc-i-1',
    subjectId: '1012-acc',
    difficulty: 'intermediate',
    topic: 'Financial Ratios',
    question: 'A company has Current Assets of R450,000 (including Inventory of R150,000) and Current Liabilities of R200,000. Calculate the Acid-Test (Quick) Ratio.',
    options: ['1.5 : 1', '2.25 : 1', '0.75 : 1', '3.0 : 1'],
    correctIndex: 0,
    explanation: 'Acid-Test Ratio = (Current Assets - Inventories) / Current Liabilities = (450,000 - 150,000) / 200,000 = 300,000 / 200,000 = 1.5 : 1.',
    examTip: 'The acid-test ratio excludes inventory because stock cannot always be converted to cash immediately.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-acc-a-1',
    subjectId: '1012-acc',
    difficulty: 'advanced',
    topic: 'Corporate Governance & Internal Controls',
    question: 'In terms of the King IV code on corporate governance, what is the primary role of the Audit Committee regarding external auditors?',
    options: [
      'To nominate independent external auditors and monitor the integrity of published financial statements',
      'To approve daily purchase orders and issue cheques to suppliers',
      'To manage company social media and marketing campaigns',
      'To determine the market selling prices of manufactured goods'
    ],
    correctIndex: 0,
    explanation: 'The Audit Committee provides independent oversight of external audit appointments, independence, and financial report reliability.',
    examTip: 'In Grade 12 Paper 1 Accounting, internal control and King IV questions carry up to 10-15 marks.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- ENGLISH FAL ---
  {
    id: 'pq-fal-f-1',
    subjectId: '1012-fal',
    difficulty: 'foundation',
    topic: 'Language Structures & Concord',
    question: 'Choose the sentence with correct subject-verb concord:',
    options: [
      'Each of the learners has submitted their assessment.',
      'Each of the learners have submitted their assessment.',
      'The group of matriculants are waiting outside.',
      'Neither the teacher nor the students was present.'
    ],
    correctIndex: 0,
    explanation: '"Each" is an indefinite pronoun that takes a singular verb ("has submitted").',
    examTip: 'Words like "each", "everyone", "neither" take singular verbs in formal Paper 1 exams.',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-fal-i-1',
    subjectId: '1012-fal',
    difficulty: 'intermediate',
    topic: 'Figures of Speech & Cartoons',
    question: 'In a political cartoon, a politician is drawn with an excessively long nose that wraps around a podium while giving a speech. What literary device is being visually portrayed?',
    options: ['Irony and visual allusion to Pinocchio (dishonesty)', 'Metaphor for superior hearing', 'Hyperbole of physical height', 'Simile comparing politicians to trees'],
    correctIndex: 0,
    explanation: 'The elongated nose is a visual allusion to Pinocchio, symbolising that the politician is lying.',
    examTip: 'When analyzing cartoons in Paper 1 Question 4, always state: facial expression, body language, visual symbols, and message.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-fal-a-1',
    subjectId: '1012-fal',
    difficulty: 'advanced',
    topic: 'Summary Writing Techniques',
    question: 'In Paper 1 Question 2 (Summary), what is the most critical rule when writing the 7 points?',
    options: [
      'Use point form, own words where possible, write ONE fact per sentence, and state the exact word count',
      'Copy the exact 7 sentences from the text word-for-word in quotes',
      'Write a creative personal poem summarizing the theme',
      'Combine all 7 points into a single 300-word paragraph'
    ],
    correctIndex: 0,
    explanation: 'DBE memo awards 7 marks for 7 clear points and 3 marks for language (own words and following word count).',
    examTip: 'Indicate your final word count at the bottom. Never exceed 90 words.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- BUSINESS STUDIES ---
  {
    id: 'pq-bs-f-1',
    subjectId: '1012-bs',
    difficulty: 'foundation',
    topic: 'Business Environments',
    question: 'Which business environment includes the mission statement, company goals, organizational structure, and management team?',
    options: ['Micro environment', 'Market environment', 'Macro environment', 'Global environment'],
    correctIndex: 0,
    explanation: 'The Micro environment is the internal environment that management can directly control.',
    examTip: 'Micro = full control; Market = influence but no control; Macro = no control (PESTLE).',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-bs-i-1',
    subjectId: '1012-bs',
    difficulty: 'intermediate',
    topic: 'Legislation: Basic Conditions of Employment Act',
    question: 'According to the BCEA, what is the standard maximum ordinary hours of work per week in South Africa?',
    options: ['45 hours per week', '40 hours per week', '50 hours per week', '35 hours per week'],
    correctIndex: 0,
    explanation: 'Under the BCEA, ordinary hours of work are a maximum of 45 hours in any week (or 9 hours/day for a 5-day week).',
    examTip: 'Overtime is capped at 10 hours per week and paid at 1.5 times normal hourly rate.',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-bs-a-1',
    subjectId: '1012-bs',
    difficulty: 'advanced',
    topic: 'Creative Thinking & Problem Solving',
    question: 'Which creative problem-solving technique involves generating ideas by having participants write ideas silently on cards, then rotating and expanding upon them in small groups?',
    options: ['Nominal Group Technique / Brainwriting', 'Delphi Technique', 'SWOT Analysis', 'Force-Field Analysis'],
    correctIndex: 0,
    explanation: 'Nominal Group Technique encourages equal participation by having members silently generate solutions before ranking them.',
    examTip: 'Delphi uses anonymous expert questionnaires across rounds, while Nominal involves in-person silent generation and voting.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- GEOGRAPHY ---
  {
    id: 'pq-geog-f-1',
    subjectId: '1012-geog',
    difficulty: 'foundation',
    topic: 'Climatology: Mid-Latitude Cyclones',
    question: 'In the Southern Hemisphere, in which direction do winds rotate around a mid-latitude low-pressure cyclone?',
    options: ['Clockwise', 'Anticlockwise', 'East to West in straight lines', 'Northwards only'],
    correctIndex: 0,
    explanation: 'Due to the Coriolis effect, low pressure systems in the Southern Hemisphere rotate CLOCKWISE.',
    examTip: 'Southern Hemisphere: Low = Clockwise, High = Anticlockwise. Opposite to Northern Hemisphere!',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-geog-i-1',
    subjectId: '1012-geog',
    difficulty: 'intermediate',
    topic: 'Geomorphology & Fluvial Features',
    question: 'What landform develops when a river meander loop is cut off during a flood, leaving an abandoned curve of water?',
    options: ['Oxbow lake', 'Alluvial fan', 'Braided stream', 'Gorge'],
    correctIndex: 0,
    explanation: 'An oxbow lake is formed when erosion on the outer bend and deposition on the inner neck eventually causes the river to breach the neck, cutting off the loop.',
    examTip: 'Often tested in Paper 1 Section B Fluvial Geomorphology with cross-sectional sketches.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-geog-a-1',
    subjectId: '1012-geog',
    difficulty: 'advanced',
    topic: 'GIS & Topographic Mapwork',
    question: 'On a 1:50,000 South African topographic map, the distance between two trigonometric beacons is measured as 8.4 cm. What is the actual ground distance in kilometers?',
    options: ['4.2 km', '8.4 km', '42.0 km', '0.42 km'],
    correctIndex: 0,
    explanation: 'On a 1:50,000 map, 1 cm represents 50,000 cm = 500 m = 0.5 km. Therefore, 8.4 cm × 0.5 km/cm = 4.2 km.',
    examTip: 'Quick rule for 1:50,000 SA topographic maps: divide centimeters by 2 to get kilometers! 8.4 / 2 = 4.2 km.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- HISTORY ---
  {
    id: 'pq-hist-f-1',
    subjectId: '1012-hist',
    difficulty: 'foundation',
    topic: 'South African History: Steve Biko',
    question: 'Which prominent anti-apartheid movement was founded by Steve Biko and fellow black university students in 1969?',
    options: ['Black Consciousness Movement (BCM)', 'African National Congress Youth League', 'Pan Africanist Congress', 'United Democratic Front'],
    correctIndex: 0,
    explanation: 'Steve Biko spearheaded the Black Consciousness Movement through the South African Students\' Organisation (SASO) in 1969.',
    examTip: 'Core philosophy of BCM: Psychological liberation before physical liberation ("Black man, you are on your own").',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-hist-i-1',
    subjectId: '1012-hist',
    difficulty: 'intermediate',
    topic: 'Cold War: Cuban Missile Crisis (1962)',
    question: 'How did US President John F. Kennedy respond to the discovery of Soviet nuclear missile sites in Cuba in October 1962?',
    options: [
      'He implemented a naval blockade ("quarantine") around Cuba',
      'He launched an immediate nuclear airstrike against Havana',
      'He signed an immediate treaty surrendering West Berlin',
      'He sent ground troops to invade Moscow'
    ],
    correctIndex: 0,
    explanation: 'JFK used a naval quarantine to stop Soviet ships from delivering further nuclear equipment while negotiating a secret agreement to remove US missiles from Turkey.',
    examTip: 'Notice the diplomatic term "quarantine" was used instead of "blockade" because a blockade is an act of war.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-hist-a-1',
    subjectId: '1012-hist',
    difficulty: 'advanced',
    topic: 'Truth and Reconciliation Commission (TRC)',
    question: 'What were the three statutory committees established under the Promotion of National Unity and Reconciliation Act of 1995 for the TRC?',
    options: [
      'Human Rights Violations Committee; Amnesty Committee; Reparation and Rehabilitation Committee',
      'Constitutional Court; Judicial Services Commission; Special Investigating Unit',
      'Land Restitution Board; Education Reform Board; Labor Tribunal',
      'Military Oversight Panel; Police Conduct Panel; Media Integrity Panel'
    ],
    correctIndex: 0,
    explanation: 'The TRC chaired by Archbishop Desmond Tutu functioned through three specialized committees: Human Rights Violations, Amnesty, and Reparation & Rehabilitation.',
    examTip: 'Criteria for amnesty: full disclosure of facts and acts must have had a political motive.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- SENIOR PHASE (GRADE 7-9) ---
  {
    id: 'pq-79-math-f',
    subjectId: '79-math',
    difficulty: 'foundation',
    topic: 'Integers & Operations',
    question: 'Calculate: (-12) - (-18) + (-5)',
    options: ['1', '-35', '-11', '25'],
    correctIndex: 0,
    explanation: 'Subtracting a negative is adding: -12 + 18 = 6. Then 6 + (-5) = 6 - 5 = 1.',
    examTip: 'Remember: minus times minus is positive. Group terms step by step.',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-79-math-i',
    subjectId: '79-math',
    difficulty: 'intermediate',
    topic: 'Linear Equations',
    question: 'Solve for x: 3(2x - 4) = 4x + 6',
    options: ['x = 9', 'x = 5', 'x = 3', 'x = 10'],
    correctIndex: 0,
    explanation: 'Expand: 6x - 12 = 4x + 6. Group like terms: 6x - 4x = 6 + 12 => 2x = 18 => x = 9.',
    examTip: 'Always check your answer: 3(2(9) - 4) = 3(14) = 42. 4(9) + 6 = 36 + 6 = 42. Verified!',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-79-math-a',
    subjectId: '79-math',
    difficulty: 'advanced',
    topic: 'Theorem of Pythagoras & Geometry',
    question: 'A 13-meter ladder rests against a vertical wall. The base of the ladder is 5 meters away from the wall on level ground. How high up the wall does the ladder reach?',
    options: ['12 meters', '14 meters', '10.5 meters', '8 meters'],
    correctIndex: 0,
    explanation: 'By Pythagoras: c² = a² + b². 13² = 5² + height² => 169 = 25 + height² => height² = 144 => height = 12 m.',
    examTip: 'This is the classic (5, 12, 13) Pythagorean triple.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },
  {
    id: 'pq-79-ns-f',
    subjectId: '79-ns',
    difficulty: 'foundation',
    topic: 'Matter & Materials: Atoms',
    question: 'What are the three subatomic particles that make up an atom?',
    options: ['Protons, Neutrons, and Electrons', 'Cells, Molecules, and Compounds', 'Solid, Liquid, and Gas', 'Photons, Neutrinos, and Quarks'],
    correctIndex: 0,
    explanation: 'Atoms consist of positively charged protons and neutral neutrons in the nucleus, surrounded by negatively charged electrons in energy levels.',
    examTip: 'Protons and electrons are equal in neutral atoms.',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-79-ns-i',
    subjectId: '79-ns',
    difficulty: 'intermediate',
    topic: 'Photosynthesis & Respiration',
    question: 'What are the primary chemical products of plant photosynthesis?',
    options: ['Glucose and Oxygen', 'Carbon dioxide and Water', 'Nitrogen and Carbon', 'Hydrogen and Sulfur'],
    correctIndex: 0,
    explanation: 'Equation: 6CO2 + 6H2O + sunlight energy → C6H12O6 (glucose) + 6O2 (oxygen).',
    examTip: 'Chlorophyll inside chloroplasts absorbs the sunlight required for this endothermic reaction.',
    bloomsLevel: 'Level 3: Complex Application',
  },
  {
    id: 'pq-79-ns-a',
    subjectId: '79-ns',
    difficulty: 'advanced',
    topic: 'Electric Circuits: Resistance & Current',
    question: 'Three identical resistors of 6 Ω each are connected in PARALLEL across a 12 V battery. What is the total equivalent resistance of the circuit?',
    options: ['2 Ω', '18 Ω', '6 Ω', '0.5 Ω'],
    correctIndex: 0,
    explanation: '1/Rtotal = 1/R1 + 1/R2 + 1/R3 = 1/6 + 1/6 + 1/6 = 3/6 = 1/2. Therefore Rtotal = 2 Ω.',
    examTip: 'Parallel resistors always have a total resistance LESS than the smallest individual resistor.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- INTERMEDIATE PHASE (GRADE 4-6) ---
  {
    id: 'pq-46-math-f',
    subjectId: '46-math',
    difficulty: 'foundation',
    topic: 'Fractions & Decimals',
    question: 'What is 3/4 converted to a decimal?',
    options: ['0.75', '0.34', '0.50', '0.25'],
    correctIndex: 0,
    explanation: 'Divide numerator by denominator: 3 ÷ 4 = 0.75.',
    examTip: 'Memorize common fractions: 1/4 = 0.25, 1/2 = 0.5, 3/4 = 0.75.',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-46-math-i',
    subjectId: '46-math',
    difficulty: 'intermediate',
    topic: 'Perimeter & Area',
    question: 'A garden bed has a length of 8 meters and a width of 5 meters. What is its total area in square meters?',
    options: ['40 m²', '26 m²', '13 m²', '48 m²'],
    correctIndex: 0,
    explanation: 'Area of a rectangle = length × width = 8 m × 5 m = 40 m².',
    examTip: 'Area is always expressed in square units (m²).',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-46-math-a',
    subjectId: '46-math',
    difficulty: 'advanced',
    topic: 'Word Problems & Long Division',
    question: 'A school has 432 learners going on an excursion. Each bus can seat 48 learners. How many buses are needed?',
    options: ['9 buses', '8 buses', '10 buses', '12 buses'],
    correctIndex: 0,
    explanation: '432 ÷ 48 = 9 exactly (48 × 9 = 432).',
    examTip: 'If there is a remainder, always round UP because you cannot leave learners behind!',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },

  // --- FOUNDATION PHASE (GRADE R-3) ---
  {
    id: 'pq-r3-math-f',
    subjectId: 'r3-math',
    difficulty: 'foundation',
    topic: 'Counting & Number Bonds',
    question: 'What is 7 + 8?',
    options: ['15', '14', '16', '13'],
    correctIndex: 0,
    explanation: 'Use making 10: 7 + 3 = 10, then 10 + 5 = 15.',
    examTip: 'Make friendly tens to add faster!',
    bloomsLevel: 'Level 1: Knowledge',
  },
  {
    id: 'pq-r3-math-i',
    subjectId: 'r3-math',
    difficulty: 'intermediate',
    topic: 'Repeated Addition & Groups',
    question: 'There are 4 baskets. Each basket has 5 juicy apples. How many apples are there altogether?',
    options: ['20 apples', '16 apples', '24 apples', '9 apples'],
    correctIndex: 0,
    explanation: '4 groups of 5 is 5 + 5 + 5 + 5 = 20 apples.',
    examTip: 'Count in 5s: 5, 10, 15, 20!',
    bloomsLevel: 'Level 2: Routine',
  },
  {
    id: 'pq-r3-math-a',
    subjectId: 'r3-math',
    difficulty: 'advanced',
    topic: 'Word Problems with Change',
    question: 'Thabo has a R20 note. He buys a loaf of bread for R13. How much change does he get back?',
    options: ['R7', 'R8', 'R6', 'R5'],
    correctIndex: 0,
    explanation: 'R20 - R13 = R7 change.',
    examTip: 'Count up from 13 to 20: 13 + 7 = 20.',
    bloomsLevel: 'Level 4: Problem Solving & Analysis',
  },
];

/**
 * Retrieve questions for a specific subject and difficulty.
 * If specific curated questions are fewer than count, fallback to extracting
 * high-yield questions from curriculum lesson quizzes and adjusting labels.
 */
export function getPracticeQuestionsForSubject(
  subjectId: string,
  difficulty: PracticeDifficulty,
  count: number = 5
): PracticeQuestion[] {
  // 1. First find curated questions matching this subject and difficulty
  const exact = CURATED_PRACTICE_QUESTIONS.filter(
    (q) => q.subjectId === subjectId && q.difficulty === difficulty
  );

  // 2. Find curated questions matching this subject at any difficulty
  const sameSubjectOtherDiff = CURATED_PRACTICE_QUESTIONS.filter(
    (q) => q.subjectId === subjectId && q.difficulty !== difficulty
  );

  let pool: PracticeQuestion[] = [...exact, ...sameSubjectOtherDiff];

  // 3. If still need more, derive from LESSONS matching this subject
  if (pool.length < count) {
    const lessonsForSub = LESSONS.filter((l) => l.subjectId === subjectId);
    for (const lesson of lessonsForSub) {
      for (const q of lesson.quiz) {
        if (!pool.some((item) => item.question === q.question)) {
          pool.push({
            id: `derived-${q.id}-${difficulty}`,
            subjectId: subjectId,
            difficulty: difficulty,
            topic: lesson.topic,
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            examTip: lesson.practicalExample.examTip || 'Focus on CAPS keywords and step-by-step reasoning.',
            bloomsLevel:
              difficulty === 'advanced'
                ? 'Level 4: Problem Solving & Analysis'
                : difficulty === 'intermediate'
                ? 'Level 3: Complex Application'
                : 'Level 2: Routine',
          });
        }
      }
    }
  }

  // 4. If subject has very few questions (e.g. niche elective), pull from general pool
  if (pool.length === 0) {
    const subjectInfo = SUBJECTS.find((s) => s.id === subjectId);
    const bandMatches = CURATED_PRACTICE_QUESTIONS.filter((q) => {
      const qSub = SUBJECTS.find((s) => s.id === q.subjectId);
      return qSub?.gradeBand === subjectInfo?.gradeBand;
    });
    pool = bandMatches.length > 0 ? bandMatches : CURATED_PRACTICE_QUESTIONS;
  }

  // Shuffle and slice to desired count
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

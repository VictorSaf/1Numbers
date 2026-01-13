// Numerological Remedies Library
// Colors, stones, mantras, favorable days, and other remedies for each number

export interface NumberRemedy {
  number: number;
  colors: {
    primary: string;
    secondary: string[];
    avoid: string[];
    hex: string;
  };
  gemstones: {
    primary: string;
    alternatives: string[];
    metal: string;
  };
  days: {
    favorable: string[];
    avoid: string[];
  };
  directions: {
    favorable: string[];
    avoid: string[];
  };
  mantras: {
    vedic: string;
    affirmation: string;
  };
  elements: {
    element: string;
    foods: string[];
    avoidFoods: string[];
  };
  planet: {
    name: string;
    symbol: string;
    deity: string;
  };
  bodyParts: string[];
  careers: string[];
  remedialActions: string[];
}

// Remedies data for numbers 1-9
const REMEDIES_DATA: Record<string, Record<number, NumberRemedy>> = {
  en: {
    1: {
      number: 1,
      colors: {
        primary: 'Gold/Yellow',
        secondary: ['Orange', 'Light Brown', 'Copper'],
        avoid: ['Black', 'Dark Blue', 'Gray'],
        hex: '#FFD700',
      },
      gemstones: {
        primary: 'Ruby',
        alternatives: ['Garnet', 'Red Spinel', 'Star Ruby'],
        metal: 'Gold',
      },
      days: {
        favorable: ['Sunday'],
        avoid: ['Saturday'],
      },
      directions: {
        favorable: ['East'],
        avoid: ['West'],
      },
      mantras: {
        vedic: 'Om Suryaya Namaha',
        affirmation: 'I am a powerful leader. I create my own success.',
      },
      elements: {
        element: 'Fire',
        foods: ['Wheat', 'Almonds', 'Dates', 'Oranges', 'Honey'],
        avoidFoods: ['Heavy meats', 'Black lentils'],
      },
      planet: {
        name: 'Sun',
        symbol: '☉',
        deity: 'Surya',
      },
      bodyParts: ['Heart', 'Spine', 'Right Eye'],
      careers: ['Leadership', 'Politics', 'Government', 'Administration', 'Medicine'],
      remedialActions: [
        'Wake up early and greet the sunrise',
        'Wear gold jewelry on Sunday',
        'Donate wheat or jaggery on Sundays',
        'Practice meditation during sunrise',
        'Maintain good posture and confidence',
      ],
    },
    2: {
      number: 2,
      colors: {
        primary: 'White/Cream',
        secondary: ['Silver', 'Light Green', 'Pearl White'],
        avoid: ['Red', 'Orange', 'Dark colors'],
        hex: '#FFFAF0',
      },
      gemstones: {
        primary: 'Pearl',
        alternatives: ['Moonstone', 'White Sapphire', 'Opal'],
        metal: 'Silver',
      },
      days: {
        favorable: ['Monday'],
        avoid: ['Sunday'],
      },
      directions: {
        favorable: ['Northwest'],
        avoid: ['Southeast'],
      },
      mantras: {
        vedic: 'Om Chandraya Namaha',
        affirmation: 'I trust my intuition. I flow with life gracefully.',
      },
      elements: {
        element: 'Water',
        foods: ['Rice', 'Milk', 'Cucumber', 'Melons', 'Coconut'],
        avoidFoods: ['Spicy foods', 'Red meat'],
      },
      planet: {
        name: 'Moon',
        symbol: '☽',
        deity: 'Chandra',
      },
      bodyParts: ['Mind', 'Stomach', 'Left Eye', 'Breasts'],
      careers: ['Counseling', 'Healthcare', 'Hospitality', 'Art', 'Public Relations'],
      remedialActions: [
        'Drink water from a silver vessel',
        'Keep a small silver item in your pocket',
        'Donate white items on Mondays',
        'Practice moon gazing meditation',
        'Spend time near water bodies',
      ],
    },
    3: {
      number: 3,
      colors: {
        primary: 'Yellow',
        secondary: ['Gold', 'Light Orange', 'Cream'],
        avoid: ['Blue', 'Black'],
        hex: '#FFFF00',
      },
      gemstones: {
        primary: 'Yellow Sapphire',
        alternatives: ['Citrine', 'Yellow Topaz', 'Golden Beryl'],
        metal: 'Gold',
      },
      days: {
        favorable: ['Thursday'],
        avoid: ['Wednesday'],
      },
      directions: {
        favorable: ['Northeast'],
        avoid: ['South'],
      },
      mantras: {
        vedic: 'Om Brihaspataye Namaha',
        affirmation: 'I express myself freely. Abundance flows to me.',
      },
      elements: {
        element: 'Ether/Space',
        foods: ['Yellow fruits', 'Turmeric', 'Bananas', 'Chickpeas', 'Ghee'],
        avoidFoods: ['Alcohol', 'Non-vegetarian on Thursdays'],
      },
      planet: {
        name: 'Jupiter',
        symbol: '♃',
        deity: 'Brihaspati',
      },
      bodyParts: ['Liver', 'Thighs', 'Fat tissue'],
      careers: ['Teaching', 'Law', 'Banking', 'Philosophy', 'Publishing'],
      remedialActions: [
        'Wear yellow on Thursdays',
        'Respect teachers and elders',
        'Donate yellow items or turmeric',
        'Study scriptures or philosophy',
        'Feed bananas to poor or animals',
      ],
    },
    4: {
      number: 4,
      colors: {
        primary: 'Blue',
        secondary: ['Gray', 'Khaki', 'Electric Blue'],
        avoid: ['Black', 'Red'],
        hex: '#4169E1',
      },
      gemstones: {
        primary: 'Hessonite (Gomed)',
        alternatives: ['Blue Sapphire', 'Lapis Lazuli'],
        metal: 'Mixed metals',
      },
      days: {
        favorable: ['Saturday', 'Sunday'],
        avoid: ['Monday'],
      },
      directions: {
        favorable: ['Southwest'],
        avoid: ['Northeast'],
      },
      mantras: {
        vedic: 'Om Raahurave Namaha',
        affirmation: 'I build strong foundations. I embrace discipline.',
      },
      elements: {
        element: 'Air',
        foods: ['Root vegetables', 'Grains', 'Sesame seeds'],
        avoidFoods: ['Alcohol', 'Tobacco'],
      },
      planet: {
        name: 'Rahu/Uranus',
        symbol: '☊',
        deity: 'Rahu',
      },
      bodyParts: ['Skin', 'Teeth', 'Bones'],
      careers: ['Engineering', 'Architecture', 'Technology', 'Innovation', 'Research'],
      remedialActions: [
        'Maintain regular routines',
        'Keep your living space organized',
        'Donate to orphanages',
        'Avoid impulsive decisions',
        'Practice grounding exercises',
      ],
    },
    5: {
      number: 5,
      colors: {
        primary: 'Green',
        secondary: ['Light Gray', 'Mixed colors', 'Turquoise'],
        avoid: ['Red', 'Orange'],
        hex: '#32CD32',
      },
      gemstones: {
        primary: 'Emerald',
        alternatives: ['Green Tourmaline', 'Peridot', 'Jade'],
        metal: 'Bronze or mixed',
      },
      days: {
        favorable: ['Wednesday'],
        avoid: ['Thursday'],
      },
      directions: {
        favorable: ['North'],
        avoid: ['South'],
      },
      mantras: {
        vedic: 'Om Budhaya Namaha',
        affirmation: 'I communicate clearly. I adapt to all situations.',
      },
      elements: {
        element: 'Earth',
        foods: ['Green vegetables', 'Moong dal', 'Green grapes'],
        avoidFoods: ['Eggs on Wednesday'],
      },
      planet: {
        name: 'Mercury',
        symbol: '☿',
        deity: 'Budha',
      },
      bodyParts: ['Nervous system', 'Arms', 'Lungs', 'Tongue'],
      careers: ['Communication', 'Writing', 'Trading', 'Travel', 'Sales'],
      remedialActions: [
        'Wear green on Wednesdays',
        'Feed green grass to cows',
        'Practice clear communication',
        'Learn new skills regularly',
        'Travel and explore new places',
      ],
    },
    6: {
      number: 6,
      colors: {
        primary: 'Pink',
        secondary: ['White', 'Light Blue', 'Pastel colors'],
        avoid: ['Red', 'Dark colors'],
        hex: '#FFB6C1',
      },
      gemstones: {
        primary: 'Diamond',
        alternatives: ['White Sapphire', 'Zircon', 'Clear Quartz'],
        metal: 'Platinum or Silver',
      },
      days: {
        favorable: ['Friday'],
        avoid: ['Tuesday'],
      },
      directions: {
        favorable: ['Southeast'],
        avoid: ['Northwest'],
      },
      mantras: {
        vedic: 'Om Shukraya Namaha',
        affirmation: 'I attract love and beauty. I create harmony.',
      },
      elements: {
        element: 'Water',
        foods: ['Sweet fruits', 'Rice pudding', 'Sugar', 'White foods'],
        avoidFoods: ['Sour foods', 'Heavy spices'],
      },
      planet: {
        name: 'Venus',
        symbol: '♀',
        deity: 'Shukra',
      },
      bodyParts: ['Reproductive system', 'Kidneys', 'Face', 'Throat'],
      careers: ['Arts', 'Design', 'Fashion', 'Beauty', 'Entertainment', 'Hospitality'],
      remedialActions: [
        'Wear white or pink on Fridays',
        'Donate white items or sweets',
        'Maintain personal grooming',
        'Appreciate beauty in daily life',
        'Practice acts of kindness',
      ],
    },
    7: {
      number: 7,
      colors: {
        primary: 'Violet/Purple',
        secondary: ['Light Gray', 'Smoke', 'Lavender'],
        avoid: ['Black', 'Red'],
        hex: '#8A2BE2',
      },
      gemstones: {
        primary: "Cat's Eye (Lehsunia)",
        alternatives: ['Amethyst', 'Tiger Eye'],
        metal: 'Silver',
      },
      days: {
        favorable: ['Monday'],
        avoid: ['Sunday'],
      },
      directions: {
        favorable: ['Southwest'],
        avoid: ['Northeast'],
      },
      mantras: {
        vedic: 'Om Ketave Namaha',
        affirmation: 'I trust my inner wisdom. I seek deeper truth.',
      },
      elements: {
        element: 'Water',
        foods: ['Light foods', 'Fruits', 'Vegetables', 'Coconut'],
        avoidFoods: ['Heavy meats', 'Alcohol'],
      },
      planet: {
        name: 'Ketu/Neptune',
        symbol: '☋',
        deity: 'Ketu',
      },
      bodyParts: ['Spine', 'Nervous system', 'Dreams'],
      careers: ['Research', 'Spirituality', 'Healing', 'Psychology', 'Writing', 'Philosophy'],
      remedialActions: [
        'Practice daily meditation',
        'Spend time in solitude',
        'Study spiritual texts',
        'Feed dogs (sacred to Ketu)',
        'Visit spiritual places',
      ],
    },
    8: {
      number: 8,
      colors: {
        primary: 'Black/Dark Blue',
        secondary: ['Navy', 'Dark Purple', 'Gray'],
        avoid: ['Red', 'Orange', 'Yellow'],
        hex: '#000080',
      },
      gemstones: {
        primary: 'Blue Sapphire (Neelam)',
        alternatives: ['Amethyst', 'Black Pearl', 'Iolite'],
        metal: 'Iron or Steel',
      },
      days: {
        favorable: ['Saturday'],
        avoid: ['Sunday', 'Tuesday'],
      },
      directions: {
        favorable: ['West'],
        avoid: ['East'],
      },
      mantras: {
        vedic: 'Om Shanaischaraya Namaha',
        affirmation: 'I am patient and persistent. Success comes through discipline.',
      },
      elements: {
        element: 'Air',
        foods: ['Black sesame', 'Black lentils', 'Mustard oil'],
        avoidFoods: ['Non-veg on Saturdays', 'Alcohol'],
      },
      planet: {
        name: 'Saturn',
        symbol: '♄',
        deity: 'Shani',
      },
      bodyParts: ['Bones', 'Teeth', 'Knees', 'Joints'],
      careers: ['Mining', 'Real Estate', 'Agriculture', 'Law', 'Politics', 'Iron/Steel'],
      remedialActions: [
        'Donate black items on Saturdays',
        'Feed crows',
        'Respect servants and elderly',
        'Maintain honesty in all dealings',
        'Practice patience and discipline',
      ],
    },
    9: {
      number: 9,
      colors: {
        primary: 'Red',
        secondary: ['Scarlet', 'Coral', 'Pink'],
        avoid: ['Black', 'Blue'],
        hex: '#DC143C',
      },
      gemstones: {
        primary: 'Red Coral (Moonga)',
        alternatives: ['Carnelian', 'Red Jasper', 'Bloodstone'],
        metal: 'Copper or Gold',
      },
      days: {
        favorable: ['Tuesday', 'Thursday'],
        avoid: ['Saturday'],
      },
      directions: {
        favorable: ['South'],
        avoid: ['North'],
      },
      mantras: {
        vedic: 'Om Mangalaya Namaha',
        affirmation: 'I am courageous and strong. I fight for what is right.',
      },
      elements: {
        element: 'Fire',
        foods: ['Red lentils', 'Jaggery', 'Red fruits', 'Spicy foods'],
        avoidFoods: ['Alcohol', 'Non-veg on Tuesdays'],
      },
      planet: {
        name: 'Mars',
        symbol: '♂',
        deity: 'Mangal/Hanuman',
      },
      bodyParts: ['Blood', 'Muscles', 'Head'],
      careers: ['Military', 'Sports', 'Surgery', 'Engineering', 'Police', 'Fire services'],
      remedialActions: [
        'Wear red on Tuesdays',
        'Donate red items',
        'Recite Hanuman Chalisa',
        'Practice physical exercise',
        'Channel aggression positively',
      ],
    },
  },
  ro: {
    1: {
      number: 1,
      colors: {
        primary: 'Auriu/Galben',
        secondary: ['Portocaliu', 'Maro deschis', 'Aramiu'],
        avoid: ['Negru', 'Albastru închis', 'Gri'],
        hex: '#FFD700',
      },
      gemstones: {
        primary: 'Rubin',
        alternatives: ['Granat', 'Spinel roșu', 'Rubin stea'],
        metal: 'Aur',
      },
      days: {
        favorable: ['Duminică'],
        avoid: ['Sâmbătă'],
      },
      directions: {
        favorable: ['Est'],
        avoid: ['Vest'],
      },
      mantras: {
        vedic: 'Om Suryaya Namaha',
        affirmation: 'Sunt un lider puternic. Îmi creez propriul succes.',
      },
      elements: {
        element: 'Foc',
        foods: ['Grâu', 'Migdale', 'Curmale', 'Portocale', 'Miere'],
        avoidFoods: ['Carne grea', 'Linte neagră'],
      },
      planet: {
        name: 'Soarele',
        symbol: '☉',
        deity: 'Surya',
      },
      bodyParts: ['Inimă', 'Coloană', 'Ochiul drept'],
      careers: ['Leadership', 'Politică', 'Guvern', 'Administrație', 'Medicină'],
      remedialActions: [
        'Trezește-te devreme și salută răsăritul',
        'Poartă bijuterii de aur duminica',
        'Donează grâu sau turtă dulce duminica',
        'Practică meditația la răsărit',
        'Menține o postură și încredere bună',
      ],
    },
    2: {
      number: 2,
      colors: {
        primary: 'Alb/Crem',
        secondary: ['Argintiu', 'Verde deschis', 'Alb perlat'],
        avoid: ['Roșu', 'Portocaliu', 'Culori închise'],
        hex: '#FFFAF0',
      },
      gemstones: {
        primary: 'Perlă',
        alternatives: ['Piatră de lună', 'Safir alb', 'Opal'],
        metal: 'Argint',
      },
      days: {
        favorable: ['Luni'],
        avoid: ['Duminică'],
      },
      directions: {
        favorable: ['Nord-vest'],
        avoid: ['Sud-est'],
      },
      mantras: {
        vedic: 'Om Chandraya Namaha',
        affirmation: 'Am încredere în intuiția mea. Curg cu grație prin viață.',
      },
      elements: {
        element: 'Apă',
        foods: ['Orez', 'Lapte', 'Castraveți', 'Pepeni', 'Cocos'],
        avoidFoods: ['Mâncare picantă', 'Carne roșie'],
      },
      planet: {
        name: 'Luna',
        symbol: '☽',
        deity: 'Chandra',
      },
      bodyParts: ['Minte', 'Stomac', 'Ochiul stâng', 'Sâni'],
      careers: ['Consiliere', 'Sănătate', 'Ospitalitate', 'Artă', 'Relații publice'],
      remedialActions: [
        'Bea apă dintr-un vas de argint',
        'Păstrează un obiect mic de argint în buzunar',
        'Donează obiecte albe lunea',
        'Practică meditația privind luna',
        'Petrece timp lângă ape',
      ],
    },
    3: {
      number: 3,
      colors: {
        primary: 'Galben',
        secondary: ['Auriu', 'Portocaliu deschis', 'Crem'],
        avoid: ['Albastru', 'Negru'],
        hex: '#FFFF00',
      },
      gemstones: {
        primary: 'Safir galben',
        alternatives: ['Citrin', 'Topaz galben', 'Beril auriu'],
        metal: 'Aur',
      },
      days: {
        favorable: ['Joi'],
        avoid: ['Miercuri'],
      },
      directions: {
        favorable: ['Nord-est'],
        avoid: ['Sud'],
      },
      mantras: {
        vedic: 'Om Brihaspataye Namaha',
        affirmation: 'Mă exprim liber. Abundența curge spre mine.',
      },
      elements: {
        element: 'Eter/Spațiu',
        foods: ['Fructe galbene', 'Turmeric', 'Banane', 'Năut', 'Ghee'],
        avoidFoods: ['Alcool', 'Non-vegetarian joi'],
      },
      planet: {
        name: 'Jupiter',
        symbol: '♃',
        deity: 'Brihaspati',
      },
      bodyParts: ['Ficat', 'Coapse', 'Țesut adipos'],
      careers: ['Învățământ', 'Drept', 'Bănci', 'Filosofie', 'Publicare'],
      remedialActions: [
        'Poartă galben joi',
        'Respectă profesorii și bătrânii',
        'Donează obiecte galbene sau turmeric',
        'Studiază scripturi sau filosofie',
        'Hrănește săracii sau animalele cu banane',
      ],
    },
    4: {
      number: 4,
      colors: {
        primary: 'Albastru',
        secondary: ['Gri', 'Kaki', 'Albastru electric'],
        avoid: ['Negru', 'Roșu'],
        hex: '#4169E1',
      },
      gemstones: {
        primary: 'Hessonit (Gomed)',
        alternatives: ['Safir albastru', 'Lapis Lazuli'],
        metal: 'Metale mixte',
      },
      days: {
        favorable: ['Sâmbătă', 'Duminică'],
        avoid: ['Luni'],
      },
      directions: {
        favorable: ['Sud-vest'],
        avoid: ['Nord-est'],
      },
      mantras: {
        vedic: 'Om Raahurave Namaha',
        affirmation: 'Construiesc fundații solide. Îmbrățișez disciplina.',
      },
      elements: {
        element: 'Aer',
        foods: ['Legume rădăcinoase', 'Cereale', 'Semințe de susan'],
        avoidFoods: ['Alcool', 'Tutun'],
      },
      planet: {
        name: 'Rahu/Uranus',
        symbol: '☊',
        deity: 'Rahu',
      },
      bodyParts: ['Piele', 'Dinți', 'Oase'],
      careers: ['Inginerie', 'Arhitectură', 'Tehnologie', 'Inovație', 'Cercetare'],
      remedialActions: [
        'Menține rutine regulate',
        'Păstrează spațiul de locuit organizat',
        'Donează la orfelinate',
        'Evită deciziile impulsive',
        'Practică exerciții de împământare',
      ],
    },
    5: {
      number: 5,
      colors: {
        primary: 'Verde',
        secondary: ['Gri deschis', 'Culori mixte', 'Turcoaz'],
        avoid: ['Roșu', 'Portocaliu'],
        hex: '#32CD32',
      },
      gemstones: {
        primary: 'Smarald',
        alternatives: ['Turmalină verde', 'Peridot', 'Jad'],
        metal: 'Bronz sau mixt',
      },
      days: {
        favorable: ['Miercuri'],
        avoid: ['Joi'],
      },
      directions: {
        favorable: ['Nord'],
        avoid: ['Sud'],
      },
      mantras: {
        vedic: 'Om Budhaya Namaha',
        affirmation: 'Comunic clar. Mă adaptez la toate situațiile.',
      },
      elements: {
        element: 'Pământ',
        foods: ['Legume verzi', 'Linte moong', 'Struguri verzi'],
        avoidFoods: ['Ouă miercuri'],
      },
      planet: {
        name: 'Mercur',
        symbol: '☿',
        deity: 'Budha',
      },
      bodyParts: ['Sistem nervos', 'Brațe', 'Plămâni', 'Limbă'],
      careers: ['Comunicare', 'Scriere', 'Comerț', 'Călătorii', 'Vânzări'],
      remedialActions: [
        'Poartă verde miercuri',
        'Hrănește vacile cu iarbă verde',
        'Practică comunicarea clară',
        'Învață abilități noi regulat',
        'Călătorește și explorează locuri noi',
      ],
    },
    6: {
      number: 6,
      colors: {
        primary: 'Roz',
        secondary: ['Alb', 'Albastru deschis', 'Culori pastelate'],
        avoid: ['Roșu', 'Culori închise'],
        hex: '#FFB6C1',
      },
      gemstones: {
        primary: 'Diamant',
        alternatives: ['Safir alb', 'Zircon', 'Cuarț clar'],
        metal: 'Platină sau Argint',
      },
      days: {
        favorable: ['Vineri'],
        avoid: ['Marți'],
      },
      directions: {
        favorable: ['Sud-est'],
        avoid: ['Nord-vest'],
      },
      mantras: {
        vedic: 'Om Shukraya Namaha',
        affirmation: 'Atrag iubire și frumusețe. Creez armonie.',
      },
      elements: {
        element: 'Apă',
        foods: ['Fructe dulci', 'Budincă de orez', 'Zahăr', 'Alimente albe'],
        avoidFoods: ['Alimente acre', 'Condimente puternice'],
      },
      planet: {
        name: 'Venus',
        symbol: '♀',
        deity: 'Shukra',
      },
      bodyParts: ['Sistem reproductiv', 'Rinichi', 'Față', 'Gât'],
      careers: ['Arte', 'Design', 'Modă', 'Frumusețe', 'Divertisment', 'Ospitalitate'],
      remedialActions: [
        'Poartă alb sau roz vineri',
        'Donează obiecte albe sau dulciuri',
        'Menține îngrijirea personală',
        'Apreciază frumusețea în viața de zi cu zi',
        'Practică acte de bunătate',
      ],
    },
    7: {
      number: 7,
      colors: {
        primary: 'Violet/Mov',
        secondary: ['Gri deschis', 'Cenușiu', 'Lavandă'],
        avoid: ['Negru', 'Roșu'],
        hex: '#8A2BE2',
      },
      gemstones: {
        primary: 'Ochi de pisică (Lehsunia)',
        alternatives: ['Ametist', 'Ochi de tigru'],
        metal: 'Argint',
      },
      days: {
        favorable: ['Luni'],
        avoid: ['Duminică'],
      },
      directions: {
        favorable: ['Sud-vest'],
        avoid: ['Nord-est'],
      },
      mantras: {
        vedic: 'Om Ketave Namaha',
        affirmation: 'Am încredere în înțelepciunea interioară. Caut adevărul profund.',
      },
      elements: {
        element: 'Apă',
        foods: ['Alimente ușoare', 'Fructe', 'Legume', 'Cocos'],
        avoidFoods: ['Carne grea', 'Alcool'],
      },
      planet: {
        name: 'Ketu/Neptun',
        symbol: '☋',
        deity: 'Ketu',
      },
      bodyParts: ['Coloană', 'Sistem nervos', 'Vise'],
      careers: ['Cercetare', 'Spiritualitate', 'Vindecare', 'Psihologie', 'Scriere', 'Filosofie'],
      remedialActions: [
        'Practică meditația zilnic',
        'Petrece timp în singurătate',
        'Studiază texte spirituale',
        'Hrănește câinii (sacri pentru Ketu)',
        'Vizitează locuri spirituale',
      ],
    },
    8: {
      number: 8,
      colors: {
        primary: 'Negru/Albastru închis',
        secondary: ['Navy', 'Mov închis', 'Gri'],
        avoid: ['Roșu', 'Portocaliu', 'Galben'],
        hex: '#000080',
      },
      gemstones: {
        primary: 'Safir albastru (Neelam)',
        alternatives: ['Ametist', 'Perlă neagră', 'Iolit'],
        metal: 'Fier sau Oțel',
      },
      days: {
        favorable: ['Sâmbătă'],
        avoid: ['Duminică', 'Marți'],
      },
      directions: {
        favorable: ['Vest'],
        avoid: ['Est'],
      },
      mantras: {
        vedic: 'Om Shanaischaraya Namaha',
        affirmation: 'Sunt răbdător și persistent. Succesul vine prin disciplină.',
      },
      elements: {
        element: 'Aer',
        foods: ['Susan negru', 'Linte neagră', 'Ulei de muștar'],
        avoidFoods: ['Non-veg sâmbăta', 'Alcool'],
      },
      planet: {
        name: 'Saturn',
        symbol: '♄',
        deity: 'Shani',
      },
      bodyParts: ['Oase', 'Dinți', 'Genunchi', 'Articulații'],
      careers: ['Minerit', 'Imobiliare', 'Agricultură', 'Drept', 'Politică', 'Fier/Oțel'],
      remedialActions: [
        'Donează obiecte negre sâmbăta',
        'Hrănește ciorile',
        'Respectă servitorii și bătrânii',
        'Menține onestitatea în toate',
        'Practică răbdarea și disciplina',
      ],
    },
    9: {
      number: 9,
      colors: {
        primary: 'Roșu',
        secondary: ['Stacojiu', 'Coral', 'Roz'],
        avoid: ['Negru', 'Albastru'],
        hex: '#DC143C',
      },
      gemstones: {
        primary: 'Coral roșu (Moonga)',
        alternatives: ['Carnelian', 'Jasp roșu', 'Piatră de sânge'],
        metal: 'Cupru sau Aur',
      },
      days: {
        favorable: ['Marți', 'Joi'],
        avoid: ['Sâmbătă'],
      },
      directions: {
        favorable: ['Sud'],
        avoid: ['Nord'],
      },
      mantras: {
        vedic: 'Om Mangalaya Namaha',
        affirmation: 'Sunt curajos și puternic. Lupt pentru ceea ce este drept.',
      },
      elements: {
        element: 'Foc',
        foods: ['Linte roșie', 'Turtă dulce', 'Fructe roșii', 'Mâncare picantă'],
        avoidFoods: ['Alcool', 'Non-veg marți'],
      },
      planet: {
        name: 'Marte',
        symbol: '♂',
        deity: 'Mangal/Hanuman',
      },
      bodyParts: ['Sânge', 'Mușchi', 'Cap'],
      careers: ['Militar', 'Sport', 'Chirurgie', 'Inginerie', 'Poliție', 'Pompieri'],
      remedialActions: [
        'Poartă roșu marți',
        'Donează obiecte roșii',
        'Recită Hanuman Chalisa',
        'Practică exerciții fizice',
        'Canalizează agresiunea pozitiv',
      ],
    },
  },
  ru: {
    1: {
      number: 1,
      colors: {
        primary: 'Золотой/Желтый',
        secondary: ['Оранжевый', 'Светло-коричневый', 'Медный'],
        avoid: ['Черный', 'Темно-синий', 'Серый'],
        hex: '#FFD700',
      },
      gemstones: {
        primary: 'Рубин',
        alternatives: ['Гранат', 'Красная шпинель', 'Звездчатый рубин'],
        metal: 'Золото',
      },
      days: {
        favorable: ['Воскресенье'],
        avoid: ['Суббота'],
      },
      directions: {
        favorable: ['Восток'],
        avoid: ['Запад'],
      },
      mantras: {
        vedic: 'Ом Сурьяя Намаха',
        affirmation: 'Я сильный лидер. Я создаю свой собственный успех.',
      },
      elements: {
        element: 'Огонь',
        foods: ['Пшеница', 'Миндаль', 'Финики', 'Апельсины', 'Мед'],
        avoidFoods: ['Тяжелое мясо', 'Черная чечевица'],
      },
      planet: {
        name: 'Солнце',
        symbol: '☉',
        deity: 'Сурья',
      },
      bodyParts: ['Сердце', 'Позвоночник', 'Правый глаз'],
      careers: ['Лидерство', 'Политика', 'Правительство', 'Администрация', 'Медицина'],
      remedialActions: [
        'Просыпайтесь рано и приветствуйте восход',
        'Носите золотые украшения по воскресеньям',
        'Жертвуйте пшеницу или джаггери по воскресеньям',
        'Практикуйте медитацию на восходе',
        'Сохраняйте хорошую осанку и уверенность',
      ],
    },
    // ... (abbreviated for length - would include all 9 numbers in Russian)
    2: {
      number: 2,
      colors: { primary: 'Белый/Кремовый', secondary: ['Серебряный', 'Светло-зеленый'], avoid: ['Красный'], hex: '#FFFAF0' },
      gemstones: { primary: 'Жемчуг', alternatives: ['Лунный камень', 'Опал'], metal: 'Серебро' },
      days: { favorable: ['Понедельник'], avoid: ['Воскресенье'] },
      directions: { favorable: ['Северо-запад'], avoid: ['Юго-восток'] },
      mantras: { vedic: 'Ом Чандрая Намаха', affirmation: 'Я доверяю своей интуиции.' },
      elements: { element: 'Вода', foods: ['Рис', 'Молоко', 'Огурцы'], avoidFoods: ['Острая пища'] },
      planet: { name: 'Луна', symbol: '☽', deity: 'Чандра' },
      bodyParts: ['Ум', 'Желудок'],
      careers: ['Консультирование', 'Здравоохранение', 'Искусство'],
      remedialActions: ['Пейте воду из серебряного сосуда', 'Жертвуйте белые предметы по понедельникам'],
    },
    3: {
      number: 3,
      colors: { primary: 'Желтый', secondary: ['Золотой', 'Кремовый'], avoid: ['Синий', 'Черный'], hex: '#FFFF00' },
      gemstones: { primary: 'Желтый сапфир', alternatives: ['Цитрин', 'Топаз'], metal: 'Золото' },
      days: { favorable: ['Четверг'], avoid: ['Среда'] },
      directions: { favorable: ['Северо-восток'], avoid: ['Юг'] },
      mantras: { vedic: 'Ом Брихаспатайе Намаха', affirmation: 'Я свободно выражаю себя.' },
      elements: { element: 'Эфир', foods: ['Желтые фрукты', 'Куркума', 'Бананы'], avoidFoods: ['Алкоголь'] },
      planet: { name: 'Юпитер', symbol: '♃', deity: 'Брихаспати' },
      bodyParts: ['Печень', 'Бедра'],
      careers: ['Преподавание', 'Право', 'Банковское дело'],
      remedialActions: ['Носите желтое по четвергам', 'Уважайте учителей'],
    },
    4: {
      number: 4,
      colors: { primary: 'Синий', secondary: ['Серый', 'Хаки'], avoid: ['Черный', 'Красный'], hex: '#4169E1' },
      gemstones: { primary: 'Гессонит', alternatives: ['Синий сапфир', 'Лазурит'], metal: 'Смешанные металлы' },
      days: { favorable: ['Суббота', 'Воскресенье'], avoid: ['Понедельник'] },
      directions: { favorable: ['Юго-запад'], avoid: ['Северо-восток'] },
      mantras: { vedic: 'Ом Раахураве Намаха', affirmation: 'Я строю крепкие основы.' },
      elements: { element: 'Воздух', foods: ['Корнеплоды', 'Злаки'], avoidFoods: ['Алкоголь', 'Табак'] },
      planet: { name: 'Раху/Уран', symbol: '☊', deity: 'Раху' },
      bodyParts: ['Кожа', 'Зубы', 'Кости'],
      careers: ['Инженерия', 'Архитектура', 'Технологии'],
      remedialActions: ['Поддерживайте регулярный распорядок', 'Жертвуйте в детские дома'],
    },
    5: {
      number: 5,
      colors: { primary: 'Зеленый', secondary: ['Светло-серый', 'Бирюзовый'], avoid: ['Красный'], hex: '#32CD32' },
      gemstones: { primary: 'Изумруд', alternatives: ['Зеленый турмалин', 'Перидот'], metal: 'Бронза' },
      days: { favorable: ['Среда'], avoid: ['Четверг'] },
      directions: { favorable: ['Север'], avoid: ['Юг'] },
      mantras: { vedic: 'Ом Будхая Намаха', affirmation: 'Я общаюсь ясно.' },
      elements: { element: 'Земля', foods: ['Зеленые овощи', 'Маш'], avoidFoods: ['Яйца по средам'] },
      planet: { name: 'Меркурий', symbol: '☿', deity: 'Будха' },
      bodyParts: ['Нервная система', 'Руки', 'Легкие'],
      careers: ['Коммуникации', 'Письмо', 'Торговля'],
      remedialActions: ['Носите зеленое по средам', 'Изучайте новые навыки'],
    },
    6: {
      number: 6,
      colors: { primary: 'Розовый', secondary: ['Белый', 'Пастельные'], avoid: ['Красный'], hex: '#FFB6C1' },
      gemstones: { primary: 'Бриллиант', alternatives: ['Белый сапфир', 'Циркон'], metal: 'Платина или серебро' },
      days: { favorable: ['Пятница'], avoid: ['Вторник'] },
      directions: { favorable: ['Юго-восток'], avoid: ['Северо-запад'] },
      mantras: { vedic: 'Ом Шукрая Намаха', affirmation: 'Я привлекаю любовь и красоту.' },
      elements: { element: 'Вода', foods: ['Сладкие фрукты', 'Рисовый пудинг'], avoidFoods: ['Кислые продукты'] },
      planet: { name: 'Венера', symbol: '♀', deity: 'Шукра' },
      bodyParts: ['Репродуктивная система', 'Почки'],
      careers: ['Искусство', 'Дизайн', 'Мода', 'Красота'],
      remedialActions: ['Носите белое или розовое по пятницам', 'Цените красоту'],
    },
    7: {
      number: 7,
      colors: { primary: 'Фиолетовый', secondary: ['Светло-серый', 'Лавандовый'], avoid: ['Черный', 'Красный'], hex: '#8A2BE2' },
      gemstones: { primary: 'Кошачий глаз', alternatives: ['Аметист', 'Тигровый глаз'], metal: 'Серебро' },
      days: { favorable: ['Понедельник'], avoid: ['Воскресенье'] },
      directions: { favorable: ['Юго-запад'], avoid: ['Северо-восток'] },
      mantras: { vedic: 'Ом Кетаве Намаха', affirmation: 'Я доверяю внутренней мудрости.' },
      elements: { element: 'Вода', foods: ['Легкая пища', 'Фрукты', 'Кокос'], avoidFoods: ['Тяжелое мясо', 'Алкоголь'] },
      planet: { name: 'Кету/Нептун', symbol: '☋', deity: 'Кету' },
      bodyParts: ['Позвоночник', 'Нервная система'],
      careers: ['Исследования', 'Духовность', 'Целительство'],
      remedialActions: ['Практикуйте медитацию ежедневно', 'Изучайте духовные тексты'],
    },
    8: {
      number: 8,
      colors: { primary: 'Черный/Темно-синий', secondary: ['Темно-синий', 'Серый'], avoid: ['Красный', 'Желтый'], hex: '#000080' },
      gemstones: { primary: 'Синий сапфир', alternatives: ['Аметист', 'Черный жемчуг'], metal: 'Железо или сталь' },
      days: { favorable: ['Суббота'], avoid: ['Воскресенье', 'Вторник'] },
      directions: { favorable: ['Запад'], avoid: ['Восток'] },
      mantras: { vedic: 'Ом Шанайшчарая Намаха', affirmation: 'Я терпелив и настойчив.' },
      elements: { element: 'Воздух', foods: ['Черный кунжут', 'Черная чечевица'], avoidFoods: ['Алкоголь'] },
      planet: { name: 'Сатурн', symbol: '♄', deity: 'Шани' },
      bodyParts: ['Кости', 'Зубы', 'Колени'],
      careers: ['Добыча', 'Недвижимость', 'Сельское хозяйство', 'Право'],
      remedialActions: ['Жертвуйте черные предметы по субботам', 'Кормите ворон'],
    },
    9: {
      number: 9,
      colors: { primary: 'Красный', secondary: ['Алый', 'Коралловый'], avoid: ['Черный', 'Синий'], hex: '#DC143C' },
      gemstones: { primary: 'Красный коралл', alternatives: ['Сердолик', 'Красная яшма'], metal: 'Медь или золото' },
      days: { favorable: ['Вторник', 'Четверг'], avoid: ['Суббота'] },
      directions: { favorable: ['Юг'], avoid: ['Север'] },
      mantras: { vedic: 'Ом Мангалая Намаха', affirmation: 'Я смелый и сильный.' },
      elements: { element: 'Огонь', foods: ['Красная чечевица', 'Джаггери', 'Острая пища'], avoidFoods: ['Алкоголь'] },
      planet: { name: 'Марс', symbol: '♂', deity: 'Мангал/Хануман' },
      bodyParts: ['Кровь', 'Мышцы', 'Голова'],
      careers: ['Военное дело', 'Спорт', 'Хирургия', 'Инженерия'],
      remedialActions: ['Носите красное по вторникам', 'Практикуйте физические упражнения'],
    },
  },
};

/**
 * Get remedy for a specific number
 */
export function getRemedyForNumber(number: number, language: string = 'en'): NumberRemedy | null {
  if (number < 1 || number > 9) return null;
  const langRemedies = REMEDIES_DATA[language] || REMEDIES_DATA.en;
  return langRemedies[number] || null;
}

/**
 * Get all remedies
 */
export function getAllRemedies(language: string = 'en'): NumberRemedy[] {
  const langRemedies = REMEDIES_DATA[language] || REMEDIES_DATA.en;
  return Object.values(langRemedies);
}

/**
 * Get color recommendation based on number
 */
export function getColorRecommendation(number: number, language: string = 'en'): { wear: string[]; avoid: string[]; hex: string } | null {
  const remedy = getRemedyForNumber(number, language);
  if (!remedy) return null;
  return {
    wear: [remedy.colors.primary, ...remedy.colors.secondary],
    avoid: remedy.colors.avoid,
    hex: remedy.colors.hex,
  };
}

/**
 * Get gemstone recommendation
 */
export function getGemstoneRecommendation(number: number, language: string = 'en'): { primary: string; alternatives: string[]; metal: string } | null {
  const remedy = getRemedyForNumber(number, language);
  if (!remedy) return null;
  return remedy.gemstones;
}

/**
 * Get daily remedy based on day of week
 */
export function getDailyRemedy(date: Date, language: string = 'en'): { dayNumber: number; remedy: NumberRemedy } | null {
  const dayOfWeek = date.getDay();
  // Map day of week to ruling number
  const dayToNumber: Record<number, number> = {
    0: 1, // Sunday - Sun
    1: 2, // Monday - Moon
    2: 9, // Tuesday - Mars
    3: 5, // Wednesday - Mercury
    4: 3, // Thursday - Jupiter
    5: 6, // Friday - Venus
    6: 8, // Saturday - Saturn
  };

  const number = dayToNumber[dayOfWeek];
  const remedy = getRemedyForNumber(number, language);

  if (!remedy) return null;
  return { dayNumber: number, remedy };
}

export type { NumberRemedy };

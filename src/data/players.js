// Real Football Legends Dataset with Actual Player Photos
export const FOOTBALL_PLAYERS = [
  {
    id: 'messi',
    name: 'ليونيل ميسي',
    nameEn: 'Lionel Messi',
    club: 'إنتر ميامي',
    nationality: 'الأرجنتين',
    flag: '🇦🇷',
    rating: 94,
    position: 'RW',
    number: '10',
    avatar: './players/messi.jpg'
  },
  {
    id: 'ronaldo',
    name: 'كريستيانو رونالدو',
    nameEn: 'Cristiano Ronaldo',
    club: 'النصر',
    nationality: 'البرتغال',
    flag: '🇵🇹',
    rating: 93,
    position: 'ST',
    number: '7',
    avatar: './players/ronaldo.jpg'
  },
  {
    id: 'mbappe',
    name: 'كيليان مبابي',
    nameEn: 'Kylian Mbappé',
    club: 'ريال مدريد',
    nationality: 'فرنسا',
    flag: '🇫🇷',
    rating: 93,
    position: 'ST',
    number: '9',
    avatar: './players/mbappe.jpg'
  },
  {
    id: 'haaland',
    name: 'إيرلينغ هالاند',
    nameEn: 'Erling Haaland',
    club: 'مانشستر سيتي',
    nationality: 'النرويج',
    flag: '🇳🇴',
    rating: 92,
    position: 'ST',
    number: '9',
    avatar: './players/haaland.jpg'
  },
  {
    id: 'vinicius',
    name: 'فينيسيوس جونيور',
    nameEn: 'Vinicius Jr',
    club: 'ريال مدريد',
    nationality: 'البرازيل',
    flag: '🇧🇷',
    rating: 91,
    position: 'LW',
    number: '7',
    avatar: './players/vinicius.jpg'
  },
  {
    id: 'salah',
    name: 'محمد صلاح',
    nameEn: 'Mohamed Salah',
    club: 'ليفربول',
    nationality: 'مصر',
    flag: '🇪🇬',
    rating: 91,
    position: 'RW',
    number: '11',
    avatar: './players/salah.jpg'
  },
  {
    id: 'debruyne',
    name: 'كيفين دي بروين',
    nameEn: 'Kevin De Bruyne',
    club: 'مانشستر سيتي',
    nationality: 'بلجيكا',
    flag: '🇧🇪',
    rating: 91,
    position: 'CAM',
    number: '17',
    avatar: './players/debruyne.jpg'
  },
  {
    id: 'bellingham',
    name: 'جود بيلينغهام',
    nameEn: 'Jude Bellingham',
    club: 'ريال مدريد',
    nationality: 'إنجلترا',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    rating: 90,
    position: 'CAM',
    number: '5',
    avatar: './players/bellingham.jpg'
  },
  {
    id: 'neymar',
    name: 'نيمار جونيور',
    nameEn: 'Neymar Jr',
    club: 'الهلال',
    nationality: 'البرازيل',
    flag: '🇧🇷',
    rating: 89,
    position: 'LW',
    number: '10',
    avatar: './players/neymar.jpg'
  },
  {
    id: 'modric',
    name: 'لوكا مودريتش',
    nameEn: 'Luka Modrić',
    club: 'ريال مدريد',
    nationality: 'كرواتيا',
    flag: '🇭🇷',
    rating: 88,
    position: 'CM',
    number: '10',
    avatar: './players/modric.jpg'
  },
  {
    id: 'lewandowski',
    name: 'روبرت ليفاندوفسكي',
    nameEn: 'Robert Lewandowski',
    club: 'برشلونة',
    nationality: 'بولندا',
    flag: '🇵🇱',
    rating: 90,
    position: 'ST',
    number: '9',
    avatar: './players/lewandowski.jpg'
  },
  {
    id: 'benzema',
    name: 'كريم بنزيما',
    nameEn: 'Karim Benzema',
    club: 'الاتحاد',
    nationality: 'فرنسا',
    flag: '🇫🇷',
    rating: 89,
    position: 'ST',
    number: '9',
    avatar: './players/benzema.jpg'
  }
];

export const DIFFICULTY_PRESETS = {
  easy: {
    id: 'easy',
    title: 'مبتدئ (8 بطاقات)',
    pairsCount: 4,
    flashSeconds: 4,
    label: '4 أزواج'
  },
  medium: {
    id: 'medium',
    title: 'محترف (12 بطاقة)',
    pairsCount: 6,
    flashSeconds: 3,
    label: '6 أزواج'
  },
  hard: {
    id: 'hard',
    title: 'أسطوري (16 بطاقة)',
    pairsCount: 8,
    flashSeconds: 3,
    label: '8 أزواج'
  }
};

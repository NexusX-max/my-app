// Data templates for Voltagram Reels/Post Editor

export const DEFAULT_SONGS = [
  {
    id: 'time_for_africa',
    title: 'Time for Africa',
    artist: 'Shakira feat. Freshlyground',
    duration: '3:38',
    frequency: 330,
    type: 'triangle',
    accentColor: 'from-orange-500 to-yellow-500',
    coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&q=80',
  },
  {
    id: 'lost_soul',
    title: 'Lost Soul',
    artist: 'VDJ Mahe',
    duration: '2:45',
    frequency: 220,
    type: 'sawtooth',
    accentColor: 'from-purple-600 to-indigo-900',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&q=80',
  },
  {
    id: 'waka_waka',
    title: 'Waka Waka (This Time for Africa)',
    artist: 'Shakira',
    duration: '3:22',
    frequency: 350,
    type: 'sine',
    accentColor: 'from-yellow-400 to-red-500',
    coverUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=120&q=80',
  },
  {
    id: 'birds_feather',
    title: 'Birds of a Feather',
    artist: 'Billie Eilish',
    duration: '3:30',
    frequency: 290,
    type: 'sine',
    accentColor: 'from-blue-400 to-teal-500',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&q=80',
  },
  {
    id: 'neon_sunset',
    title: 'Cyberpunk Neon Sunset',
    artist: 'Voltagram Beatmaker',
    duration: '4:12',
    frequency: 180,
    type: 'square',
    accentColor: 'from-pink-500 to-purple-650',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=120&q=80',
  }
];

export const TEMPLATES = [
  {
    id: 'fifa_match',
    name: 'FIFA World Cup 2026',
    type: 'match_card',
    aspectRatio: '9:16',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&q=80',
    data: {
      league: 'FIFA World Cup 2026™',
      sub: 'Group Stage · Group C',
      teamA: {
        name: 'Brazil',
        score: '3',
        rank: '↑ 1st',
        rankColor: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
        flag: '🇧🇷'
      },
      teamB: {
        name: 'Haiti',
        score: '0',
        rank: '— 4th',
        rankColor: 'bg-zinc-850 text-zinc-400 border border-zinc-700',
        flag: '🇭🇹'
      },
      status: 'Full-time',
      time: 'Today'
    }
  },
  {
    id: 'cyberpunk_city',
    name: 'Cyberpunk Streets',
    type: 'image',
    aspectRatio: '9:16',
    thumbnail: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=150&q=80',
    url: 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=600&q=80',
    caption: 'Neon vibes in the rain 🌧️✨ #cyberpunk #neon #voltagram'
  },
  {
    id: 'cozy_nature',
    name: 'Cozy Cabin Solitude',
    type: 'image',
    aspectRatio: '9:16',
    thumbnail: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=150&q=80',
    url: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=600&q=80',
    caption: 'Escape standard routines. Cozy cabin retreats 🏕️🌲 #wilderness #cabinlife'
  },
  {
    id: 'minimal_zen',
    name: 'Warm Sunset Reflection',
    type: 'image',
    aspectRatio: '1:1',
    thumbnail: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=150&q=80',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
    caption: 'Quiet horizons breed pristine focus 🌅🧘‍♂️ #sunset #meditative #peace'
  }
];

export const FILTERS = [
  { id: 'normal', name: 'Normal', filterStyle: 'none' },
  { id: 'paris', name: 'Paris', filterStyle: 'contrast(1.1) brightness(1.1) saturate(1.1) sepia(0.15)' },
  { id: 'los_angeles', name: 'Los Angeles', filterStyle: 'contrast(0.95) brightness(1.15) saturate(1.3) hue-rotate(5deg)' },
  { id: 'clarendon', name: 'Clarendon', filterStyle: 'contrast(1.2) saturate(1.35) brightness(1.05) hue-rotate(-5deg)' },
  { id: 'valencia', name: 'Valencia', filterStyle: 'contrast(0.9) brightness(1.1) sepia(0.25) saturate(1.05)' },
  { id: 'aden', name: 'Aden', filterStyle: 'hue-rotate(-20deg) saturate(1.1) brightness(1.15) sepia(0.1)' },
  { id: 'juno', name: 'Juno', filterStyle: 'saturate(1.5) contrast(1.1) hue-rotate(-10deg) brightness(1.05)' }
];

export const MOCK_LOCATIONS = [
  'Dhaka, Bangladesh',
  'Santiago, Chile',
  'Silicon Valley, California',
  'Miami Beach, Florida',
  'Rio de Janeiro, Brazil',
  'Tokyo Shinjuku, Japan',
  'London, United Kingdom'
];

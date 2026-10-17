// Sample markers used when the app runs without the backend (demo mode) —
// e.g. opening frontend/dist/index.html directly in a browser. Mirrors the
// server seed set (server/lib/seedData.js), currently around Pune, Maharashtra.

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const demoMarkers = [
  // ------------------------------------------------------------------ MEMORIES
  {
    id: 'demo-1', type: 'memory', category: 'tradition', title: 'Ganesh Chaturthi at Dagadusheth',
    description: 'Every year the bappa procession winds past the temple and the whole street joins in for ten days of dhol, sweets and modak. The air smells of shadu clay and camphor.',
    lat: 18.51235, lng: 73.8521, author: 'S. Kulkarni', dateLabel: 'Every August/September',
    createdAt: daysAgo(2),
  },
  {
    id: 'demo-2', type: 'memory', category: 'story', title: 'The first Ganpati visarjan I joined',
    description: 'I was eight, holding my father’s hand at the ghat as the idols went into the river. “Ganpati bappa morya!” — I still get goosebumps remembering that chant.',
    lat: 18.515, lng: 73.8585, author: 'A. Deshpande', dateLabel: 'September 1985',
    createdAt: daysAgo(5),
  },
  {
    id: 'demo-3', type: 'memory', category: 'event', title: 'PIFF opening night at Nal Stop',
    description: 'The Pune International Film Festival used to open with the whole street outside the theatre waiting for tickets. We managed to see everything twice.',
    lat: 18.5217, lng: 73.8544, author: 'R. Patil', dateLabel: 'Every January',
    createdAt: daysAgo(9),
  },
  {
    id: 'demo-4', type: 'memory', category: 'tradition', title: 'Bakarwadi Sundays at Chitale Bandhu',
    description: 'Sundays mean a queue at Chitale for fresh bakarwadi and kothimbir vadi — the taste hasn’t changed since the 1960s. Some things you just don’t argue with.',
    lat: 18.5127, lng: 73.8587, author: 'M. Joshi', dateLabel: 'Every Sunday',
    createdAt: daysAgo(12),
  },
  {
    id: 'demo-5', type: 'memory', category: 'tradition', title: 'Katakirr misal after college',
    description: 'Our ritual after lectures: an extra-spicy misal at the stall near Mithapur. One bite and you’ve earned the afternoon nap.',
    lat: 18.509, lng: 73.865, author: 'V. Gaikwad', dateLabel: '1990s',
    createdAt: daysAgo(16),
  },
  {
    id: 'demo-6', type: 'memory', category: 'story', title: 'First auto-rickshaw ride from Pune Station',
    description: 'The driver quoted a fare, then winked and switched off the meter: “First time in Pune, baba?” The whole city unfolded from that yellow seat.',
    lat: 18.52854, lng: 73.87491, author: 'N. Sharma', dateLabel: 'Summer 2001',
    createdAt: daysAgo(20),
  },

  // ------------------------------------------------------------------ HERITAGE
  {
    id: 'demo-7', type: 'heritage', category: 'landmark', title: 'Shaniwar Wada',
    description: 'The seat of the Peshwas, built in 1732. Its massive teak gates and the 21-metre walls survived the 1828 fire; the gardens host evening light-and-sound shows.',
    lat: 18.51957, lng: 73.85529, author: 'Heritage Trust', dateLabel: 'Est. 1732',
    createdAt: daysAgo(30),
  },
  {
    id: 'demo-8', type: 'heritage', category: 'monument', title: 'Aga Khan Palace',
    description: 'Built by Sultan Aga Khan III in 1892 as a famine-relief refuge, the palace is best known as the prison of Mahatma Gandhi (1942–44) and now houses his memorial.',
    lat: 18.55218, lng: 73.90147, author: 'Heritage Trust', dateLabel: 'Est. 1892',
    createdAt: daysAgo(40),
  },
  {
    id: 'demo-9', type: 'heritage', category: 'historic_site', title: 'Sinhagad Fort',
    description: 'The lion fort, 760 m above the plain, site of the 1670 Battle of Sinhagad where Tanaji Malusare’s soldiers climbed the cliff at night.',
    lat: 18.366, lng: 73.7555, author: 'Heritage Trust', dateLabel: 'Est. 1670',
    createdAt: daysAgo(50),
  },
  {
    id: 'demo-10', type: 'heritage', category: 'historic_site', title: 'Lal Mahal',
    description: 'Shivaji’s childhood residence, rebuilt on the original site near the old city. Now a small museum of his early years.',
    lat: 18.51844, lng: 73.8549, author: 'Heritage Trust', dateLabel: 'Est. 1636',
    createdAt: daysAgo(60),
  },
  {
    id: 'demo-11', type: 'heritage', category: 'landmark', title: 'Parvati Hill Temple',
    description: 'The Peshwa-era temple complex crowns the hill; a walkway of 108 steps leads to a view over the whole city.',
    lat: 18.4993, lng: 73.8459, author: 'Heritage Trust', dateLabel: 'Est. 1749',
    createdAt: daysAgo(70),
  },
  {
    id: 'demo-12', type: 'heritage', category: 'landmark', title: 'Vishrambaug Wada',
    description: 'The last wada built by the Peshwas (1807) — now offices, but the carved teak facade and inner courtyard are preserved.',
    lat: 18.51854, lng: 73.8561, author: 'Heritage Trust', dateLabel: 'Est. 1807',
    createdAt: daysAgo(80),
  },

  // ------------------------------------------------------------------ SAFETY
  {
    id: 'demo-13', type: 'safety', category: 'pothole', title: 'Pothole on Fergusson College Road',
    description: 'Deep potholes near the college gate swallow two-wheelers during the rush; patched twice, reopened within a week.',
    lat: 18.5212, lng: 73.84, severity: 'high', status: 'open', author: 'FC student', dateLabel: 'Reported 1 week ago',
    createdAt: daysAgo(7),
  },
  {
    id: 'demo-14', type: 'safety', category: 'lighting', title: 'Unlit underpass near Swargate',
    description: 'The pedestrian underpass lights have been dead for months; feels unsafe to walk through after 8pm.',
    lat: 18.5018, lng: 73.8578, severity: 'high', status: 'open', author: 'Night commuter', dateLabel: 'Reported 3 days ago',
    createdAt: daysAgo(3),
  },
  {
    id: 'demo-15', type: 'safety', category: 'traffic', title: 'Dangerous crossing at JM Road junction',
    description: 'Signal timings are too short for the foot traffic; seniors and students rush across against the flow.',
    lat: 18.5135, lng: 73.8475, severity: 'medium', status: 'in-progress', author: 'Residents’ association', dateLabel: 'Reported 2 weeks ago',
    createdAt: daysAgo(14),
  },
  {
    id: 'demo-16', type: 'safety', category: 'lighting', title: 'Broken streetlights on University Road',
    description: 'The stretch of University Road near the main gate is pitch dark after 10pm.',
    lat: 18.5522, lng: 73.8249, severity: 'medium', status: 'open', author: 'M. Bhandarkar', dateLabel: 'Reported 1 week ago',
    createdAt: daysAgo(8),
  },
  {
    id: 'demo-17', type: 'safety', category: 'flooding', title: 'Waterlogging on Karve Road in monsoon',
    description: 'Every heavy shower floods the low point near Nal Stop; auto fares double and buses crawl.',
    lat: 18.5107, lng: 73.8422, severity: 'medium', status: 'open', author: 'Bus commuter', dateLabel: 'Reported 5 days ago',
    createdAt: daysAgo(5),
  },
  {
    id: 'demo-18', type: 'safety', category: 'other', title: 'Garbage pileup near Shivajinagar bus stand',
    description: 'Open garbage attracts strays; the area needs a better collection schedule.',
    lat: 18.5287, lng: 73.8535, severity: 'low', status: 'open', author: 'Shopkeeper', dateLabel: 'Reported 2 weeks ago',
    createdAt: daysAgo(13),
  },
  {
    id: 'demo-19', type: 'safety', category: 'traffic', title: 'Speeding on Baner Road',
    description: 'No speed breakers between the flyover and Sus; evening walkers hug the footpath.',
    lat: 18.5596, lng: 73.7865, severity: 'high', status: 'open', author: 'Evening walker', dateLabel: 'Reported 1 week ago',
    createdAt: daysAgo(6),
  },
  {
    id: 'demo-20', type: 'safety', category: 'other', title: 'Loose manhole cover on Laxmi Road',
    description: 'The cover rocks under every bus and is half-open after rains.',
    lat: 18.5145, lng: 73.858, severity: 'high', status: 'open', author: 'Cycle commuter', dateLabel: 'Reported 2 days ago',
    createdAt: daysAgo(2),
  },

  // ------------------------------------------------------------------ ACCESSIBILITY
  {
    id: 'demo-21', type: 'accessibility', category: 'missing_ramp', title: 'No wheelchair ramp at Pune Station',
    description: 'The main entrance to platform 1 has stairs only; the “lift” is often out of order.',
    lat: 18.52854, lng: 73.87491, severity: 'high', status: 'open', author: 'J. Fernandes', dateLabel: 'Reported 4 days ago',
    createdAt: daysAgo(4),
  },
  {
    id: 'demo-22', type: 'accessibility', category: 'broken_footpath', title: 'Uneven footpath on FC Road',
    description: 'Lifted pavers and parked two-wheelers force wheelchair users onto the road.',
    lat: 18.521, lng: 73.841, severity: 'medium', status: 'open', author: 'A. Shinde', dateLabel: 'Reported 1 week ago',
    createdAt: daysAgo(9),
  },
  {
    id: 'demo-23', type: 'accessibility', category: 'missing_ramp', title: 'Missing kerb ramps at JM Road crossing',
    description: 'No dropped kerbs on either side; the traffic island is not accessible.',
    lat: 18.5135, lng: 73.848, severity: 'medium', status: 'open', author: 'Wheelchair user', dateLabel: 'Reported 6 days ago',
    createdAt: daysAgo(6),
  },
  {
    id: 'demo-24', type: 'accessibility', category: 'wheelchair_barrier', title: 'Step-only entrance at Shaniwar Wada museum',
    description: 'The museum hall is up a short flight with no ramp; a wooden bridge was installed but it is not level.',
    lat: 18.5192, lng: 73.8558, severity: 'high', status: 'in-progress', author: 'Tour group', dateLabel: 'Reported 2 weeks ago',
    createdAt: daysAgo(15),
  },
  {
    id: 'demo-25', type: 'accessibility', category: 'difficult_crossing', title: 'Difficult crossing at Appa Balwant Chowk',
    description: 'A five-way junction with short signals and no pedestrian island — very hard for elderly walkers.',
    lat: 18.516, lng: 73.8566, severity: 'medium', status: 'open', author: 'P. Kamble', dateLabel: 'Reported 3 weeks ago',
    createdAt: daysAgo(22),
  },
  {
    id: 'demo-26', type: 'accessibility', category: 'other', title: 'No tactile paving on Laxmi Road bus stops',
    description: 'Bus stops lack tactile guidance strips for visually impaired commuters.',
    lat: 18.5145, lng: 73.858, severity: 'low', status: 'open', author: 'D. Naik', dateLabel: 'Reported 2 weeks ago',
    createdAt: daysAgo(12),
  },
  {
    id: 'demo-27', type: 'accessibility', category: 'wheelchair_barrier', title: 'High bus footboard at Shivajinagar depot',
    description: 'PMPML buses have a high first step with no ramp at the depot stands.',
    lat: 18.529, lng: 73.8535, severity: 'medium', status: 'open', author: 'R. Jadhav', dateLabel: 'Reported 1 week ago',
    createdAt: daysAgo(10),
  },
];

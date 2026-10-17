// Visual metadata for the four marker categories. Colours follow the Roots & Routes
// brand palette and stay fixed across the whole website:
// orange = memories, purple = heritage, red = safety, blue = accessibility.

export const TYPES = {
  memory: {
    label: 'Memories',
    singular: 'Memory',
    color: '#F5A000',
    soft: '#FDEBC9',
    dark: '#7A4E00',
    icon: 'history_edu',
    blurb: 'Community stories, traditions & events',
  },
  heritage: {
    label: 'Heritage',
    singular: 'Heritage site',
    color: '#7B4FD3',
    soft: '#F0EAFB',
    dark: '#FFFFFF',
    icon: 'museum',
    blurb: 'Landmarks & protected places',
  },
  safety: {
    label: 'Safety',
    singular: 'Safety issue',
    color: '#E53935',
    soft: '#FDE9E8',
    dark: '#FFFFFF',
    icon: 'security',
    blurb: 'Unsafe locations & hazards',
  },
  accessibility: {
    label: 'Accessibility',
    singular: 'Accessibility issue',
    color: '#168FD0',
    soft: '#E4F3FB',
    dark: '#FFFFFF',
    icon: 'accessible',
    blurb: 'Barriers for people with disabilities',
  },
};

export const CATEGORIES = {
  memory: [
    { id: 'story', label: 'Story', icon: 'auto_stories' },
    { id: 'tradition', label: 'Tradition', icon: 'festival' },
    { id: 'event', label: 'Event', icon: 'celebration' },
  ],
  heritage: [
    { id: 'landmark', label: 'Landmark', icon: 'account_balance' },
    { id: 'monument', label: 'Monument', icon: 'monument' },
    { id: 'historic_site', label: 'Historic site', icon: 'history' },
    { id: 'protected_area', label: 'Protected area', icon: 'forest' },
  ],
  safety: [
    { id: 'pothole', label: 'Pothole', icon: 'report' },
    { id: 'lighting', label: 'Poor lighting', icon: 'lightbulb' },
    { id: 'vandalism', label: 'Vandalism', icon: 'brush' },
    { id: 'traffic', label: 'Traffic / crossing', icon: 'traffic' },
    { id: 'flooding', label: 'Flooding / drainage', icon: 'water' },
    { id: 'other', label: 'Other hazard', icon: 'warning' },
  ],
  accessibility: [
    { id: 'wheelchair_barrier', label: 'Wheelchair barrier', icon: 'wheelchair_pickup' },
    { id: 'broken_footpath', label: 'Broken footpath', icon: 'construction' },
    { id: 'missing_ramp', label: 'Missing ramp', icon: 'stairs' },
    { id: 'difficult_crossing', label: 'Difficult crossing', icon: 'traffic' },
    { id: 'other', label: 'Other barrier', icon: 'help' },
  ],
};

export const SEVERITY = {
  low: { label: 'Low', color: '#3E8E5A' },
  medium: { label: 'Medium', color: '#C77E00' },
  high: { label: 'High', color: '#E53935' },
};

export const STATUS = {
  open: { label: 'Open', color: '#E53935' },
  'in-progress': { label: 'In progress', color: '#C77E00' },
  resolved: { label: 'Resolved', color: '#3E8E5A' },
};

export function categoryOf(type, id) {
  return (CATEGORIES[type] || []).find((c) => c.id === id) || { id, label: id, icon: 'place' };
}

export function typeOf(id) {
  return TYPES[id] || { label: id, color: '#74777d', soft: '#e1e3e4', dark: '#fff', icon: 'place', singular: id };
}

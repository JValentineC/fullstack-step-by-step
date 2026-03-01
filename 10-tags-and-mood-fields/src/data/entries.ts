export type Mood = 'happy' | 'curious' | 'frustrated' | 'neutral'

export interface Entry {
  id: number
  title: string
  summary: string
  mood: Mood
  tags: string[]
  createdAt: string
}

const seedEntries: Entry[] = [
  {
    id: 1,
    title: 'Set up my DevLog project',
    summary:
      'Scaffolded a Vite + React + TypeScript app and learned about project structure.',
    mood: 'happy',
    tags: ['setup', 'vite'],
    createdAt: '2025-06-01T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Cleaned up the template',
    summary:
      'Removed boilerplate CSS and components, replaced them with semantic HTML.',
    mood: 'neutral',
    tags: ['html', 'cleanup'],
    createdAt: '2025-06-02T10:30:00.000Z',
  },
  {
    id: 3,
    title: 'Added a profile photo',
    summary:
      'Placed a headshot in the header using an img tag and the public folder.',
    mood: 'happy',
    tags: ['images', 'html'],
    createdAt: '2025-06-03T11:00:00.000Z',
  },
  {
    id: 4,
    title: 'Learned client-side routing',
    summary:
      'Installed react-router-dom and created Home and About pages with HashRouter.',
    mood: 'curious',
    tags: ['routing', 'react-router'],
    createdAt: '2025-06-04T14:15:00.000Z',
  },
  {
    id: 5,
    title: 'Extracted reusable components',
    summary:
      'Moved Header, Footer, and AboutSection into their own component files.',
    mood: 'happy',
    tags: ['components', 'refactor'],
    createdAt: '2025-06-05T09:45:00.000Z',
  },
]

export default seedEntries

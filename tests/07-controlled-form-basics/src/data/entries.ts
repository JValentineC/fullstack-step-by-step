export interface Entry {
  id: number
  title: string
  date: string
  summary: string
}

const entries: Entry[] = [
  {
    id: 1,
    title: 'Set up my DevLog project',
    date: '2025-06-01',
    summary:
      'Scaffolded a Vite + React + TypeScript app and learned about project structure.',
  },
  {
    id: 2,
    title: 'Cleaned up the template',
    date: '2025-06-02',
    summary:
      'Removed boilerplate CSS and components, replaced them with semantic HTML.',
  },
  {
    id: 3,
    title: 'Added a profile photo',
    date: '2025-06-03',
    summary:
      'Placed a headshot in the header using an img tag and the public folder.',
  },
  {
    id: 4,
    title: 'Learned client-side routing',
    date: '2025-06-04',
    summary:
      'Installed react-router-dom and created Home and About pages with HashRouter.',
  },
  {
    id: 5,
    title: 'Extracted reusable components',
    date: '2025-06-05',
    summary:
      'Moved Header, Footer, and AboutSection into their own component files.',
  },
]

export default entries

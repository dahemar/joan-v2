// Minimal data structure. Replace paths with your own posters and video files or embeds.
const baseEdits = [
  {
    id: 'sample-edit-1',
    title: 'Sample Edit 1',
    poster: 'https://placehold.co/800x450/EEEEEE/111111?text=Edit+1',
    src: '',
    embedUrl: 'https://player.vimeo.com/video/76979871?h=bf4c7f1a4e',
    credits: 'Director: —\nEditor: Joan Colomer\nProduction: —',
  },
  {
    id: 'sample-edit-2',
    title: 'Sample Edit 2',
    poster: 'https://placehold.co/800x450/EEEEEE/111111?text=Edit+2',
    src: '',
    embedUrl: 'https://player.vimeo.com/video/1084537?h=bf4c7f1a4e',
    credits: 'Editor: Joan Colomer',
  },
]

export const edits = [
  ...baseEdits,
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `placeholder-edit-${i + 3}`,
    title: `Placeholder Edit ${i + 3}`,
    poster: `https://placehold.co/800x450/F3F3F3/111111?text=Edit+${i + 3}`,
    src: '',
    embedUrl: 'https://player.vimeo.com/video/76979871?h=bf4c7f1a4e',
    credits: 'Editor: Joan Colomer',
  })),
]

const baseDirected = [
  {
    id: 'sample-directed-1',
    title: 'Directed Piece 1',
    poster: 'https://placehold.co/800x450/EEEEEE/111111?text=Dir+1',
    src: '',
    embedUrl: 'https://player.vimeo.com/video/22439234?h=bf4c7f1a4e',
    credits: 'Direction: Joan Colomer\nEdit: Joan Colomer',
  },
]

export const directed = [
  ...baseDirected,
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `placeholder-directed-${i + 2}`,
    title: `Placeholder Directed ${i + 2}`,
    poster: `https://placehold.co/800x450/EDEDED/111111?text=Dir+${i + 2}`,
    src: '',
    embedUrl: 'https://player.vimeo.com/video/22439234?h=bf4c7f1a4e',
    credits: 'Direction: Joan Colomer',
  })),
]



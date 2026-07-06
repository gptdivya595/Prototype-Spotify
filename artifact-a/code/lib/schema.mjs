// Controlled vocabularies + JSON schema for review enrichment (Phase 2).

export const FRUSTRATION_THEMES = [
  'repetitive_recommendations',
  'stale_discover_weekly',
  'no_control_over_recs',
  'recs_too_similar',
  'recs_ignore_taste',
  'algorithm_pushes_popular',
  'autoplay_loop',
  'hard_to_find_new_artists',
  'poor_genre_exploration',
  'no_explanation',
  'ui_friction',
  'non_discovery',
];

export const SENTIMENTS = ['positive', 'neutral', 'negative'];
export const SEGMENTS = ['power_user', 'casual', 'explorer', 'mood_based', 'unknown'];

/** OpenAI structured-outputs schema: a batch of tagged reviews. */
export const ENRICH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          sentiment: { type: 'string', enum: SENTIMENTS },
          discoveryRelated: { type: 'boolean' },
          frustrationThemes: {
            type: 'array',
            items: { type: 'string', enum: FRUSTRATION_THEMES },
          },
          jtbd: { type: ['string', 'null'] },
          segment: { type: 'string', enum: SEGMENTS },
          summary: { type: 'string' },
        },
        required: [
          'id',
          'sentiment',
          'discoveryRelated',
          'frustrationThemes',
          'jtbd',
          'segment',
          'summary',
        ],
      },
    },
  },
  required: ['results'],
};

/** Validate + coerce a single tagged item; returns null if unusable. */
export function validateTag(t) {
  if (!t || typeof t.id !== 'string') return null;
  const sentiment = SENTIMENTS.includes(t.sentiment) ? t.sentiment : 'neutral';
  const segment = SEGMENTS.includes(t.segment) ? t.segment : 'unknown';
  let themes = Array.isArray(t.frustrationThemes)
    ? t.frustrationThemes.filter((x) => FRUSTRATION_THEMES.includes(x))
    : [];
  themes = [...new Set(themes)];
  const substantiveThemes = themes.filter((x) => x !== 'non_discovery');
  const discoveryRelated = Boolean(t.discoveryRelated) && substantiveThemes.length > 0;
  themes = discoveryRelated ? substantiveThemes : ['non_discovery'];
  return {
    id: t.id,
    sentiment,
    discoveryRelated,
    frustrationThemes: themes,
    jtbd: typeof t.jtbd === 'string' && t.jtbd.trim() ? t.jtbd.trim() : null,
    segment,
    summary: typeof t.summary === 'string' ? t.summary.slice(0, 300) : '',
  };
}

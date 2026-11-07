export interface AccentTheme {
  readonly bg: string;
  readonly border: string;
  readonly text: string;
  readonly dot: string;
  readonly headerBg: string;
}

export type AccentColorName =
  'purple' | 'pink' | 'cyan' | 'teal' | 'yellow' | 'orange' | 'green' | 'blue';

export const ACCENT_THEMES: Record<AccentColorName, AccentTheme> = {
  purple: {
    bg: 'rgba(184, 41, 255, 0.2)',
    border: 'rgba(224, 179, 255, 0.55)',
    text: '#e0b3ff',
    dot: '#d580ff',
    headerBg:
      'linear-gradient(90deg, rgba(184, 41, 255, 0.28), rgba(0, 240, 255, 0.12))',
  },
  pink: {
    bg: 'rgba(255, 51, 153, 0.2)',
    border: 'rgba(255, 179, 217, 0.6)',
    text: '#ffb3d9',
    dot: '#ff4da6',
    headerBg:
      'linear-gradient(90deg, rgba(255, 51, 153, 0.28), rgba(184, 41, 255, 0.14))',
  },
  cyan: {
    bg: 'rgba(0, 240, 255, 0.18)',
    border: 'rgba(179, 245, 255, 0.6)',
    text: '#b3f5ff',
    dot: '#00f0ff',
    headerBg:
      'linear-gradient(90deg, rgba(0, 240, 255, 0.25), rgba(184, 41, 255, 0.14))',
  },
  teal: {
    bg: 'rgba(0, 255, 200, 0.18)',
    border: 'rgba(166, 255, 234, 0.6)',
    text: '#a6ffea',
    dot: '#00ffc8',
    headerBg:
      'linear-gradient(90deg, rgba(0, 255, 200, 0.25), rgba(0, 240, 255, 0.14))',
  },
  yellow: {
    bg: 'rgba(255, 230, 0, 0.18)',
    border: 'rgba(255, 242, 179, 0.6)',
    text: '#fff2b3',
    dot: '#ffe600',
    headerBg:
      'linear-gradient(90deg, rgba(255, 230, 0, 0.25), rgba(255, 51, 153, 0.14))',
  },
  orange: {
    bg: 'rgba(255, 136, 0, 0.2)',
    border: 'rgba(255, 209, 179, 0.6)',
    text: '#ffd1b3',
    dot: '#ff8800',
    headerBg:
      'linear-gradient(90deg, rgba(255, 136, 0, 0.25), rgba(255, 51, 153, 0.14))',
  },
  green: {
    bg: 'rgba(57, 255, 20, 0.18)',
    border: 'rgba(194, 240, 194, 0.6)',
    text: '#c2f0c2',
    dot: '#39ff14',
    headerBg:
      'linear-gradient(90deg, rgba(57, 255, 20, 0.22), rgba(0, 240, 255, 0.14))',
  },
  blue: {
    bg: 'rgba(59, 130, 246, 0.22)',
    border: 'rgba(179, 212, 255, 0.6)',
    text: '#b3d4ff',
    dot: '#60a5fa',
    headerBg:
      'linear-gradient(90deg, rgba(59, 130, 246, 0.28), rgba(0, 240, 255, 0.14))',
  },
};

export const AURORA_CARE_FLUFF_STOPS: readonly string[] = [
  '#9333ea',
  '#ec4899',
  '#06b6d4',
  '#14b8a6',
  '#7e22ce',
];

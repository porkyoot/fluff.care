import type * as AstroPlugin from 'eslint-plugin-astro';
import type * as I18nextPlugin from 'eslint-plugin-i18next';
import type * as JsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import type * as ReactPlugin from 'eslint-plugin-react';
import type * as ReactHooksPlugin from 'eslint-plugin-react-hooks';
import type * as TsEslint from 'typescript-eslint';

export type GuardrailsEslintRefs = readonly [
  typeof AstroPlugin,
  typeof I18nextPlugin,
  typeof JsxA11yPlugin,
  typeof ReactPlugin,
  typeof ReactHooksPlugin,
  typeof TsEslint,
];

export {
  ACCENT_THEMES,
  AURORA_CARE_FLUFF_STOPS,
  type AccentColorName,
  type AccentTheme,
} from './tokens/palette';
export { CARE_FLUFF_STRINGS } from './i18n/strings';
export {
  DEFAULT_CARE_FLUFF_PORTS,
  buildServerEndpoints,
  formatPlayerStatus,
  hasDistinctPorts,
  type CareFluffPorts,
  type ServerEndpointSummary,
} from './domain/care-fluff';

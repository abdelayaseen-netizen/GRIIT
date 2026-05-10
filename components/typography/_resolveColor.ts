import { DS_COLORS_V2 } from '@/lib/design-system';

export type ColorVariant = 'primary' | 'secondary' | 'tertiary';

/** Single source of truth for typography color resolution.
 *  Used by Title/Label/Body/Caption/Headline. */
export function resolveColor(onDark: boolean, variant: ColorVariant): string {
  if (onDark) {
    if (variant === 'primary') return DS_COLORS_V2.text.onDark;
    if (variant === 'secondary') return DS_COLORS_V2.text.onDarkSecondary;
    return DS_COLORS_V2.text.onDarkTertiary;
  }
  if (variant === 'primary') return DS_COLORS_V2.text.primary;
  if (variant === 'secondary') return DS_COLORS_V2.text.secondary;
  return DS_COLORS_V2.text.tertiary;
}

import { TINTED_ICON_TILE_COLOR_SHADES } from '@ui/display/tinted-icon-tile/internal/constants/tintedIconTileColorShades.constant';
import { getColorFromTheme } from '@ui/display/tinted-icon-tile/internal/utils/getColorFromTheme';
import { parseThemeColor } from '@ui/utilities';

export type IconTileColorShades = {
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
};

// Optale Orbital: force monochrome tiles across the whole CRM, ignoring
// per-object iconColor from the DB. Flip OPTALE_ORBITAL_MONOCHROME_ICONS to
// false to restore upstream rainbow tinting.
const OPTALE_ORBITAL_MONOCHROME_ICONS = true;

export const getIconTileColorShades = (
  color: string | null | undefined,
): IconTileColorShades => {
  if (OPTALE_ORBITAL_MONOCHROME_ICONS) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      iconColor: '#f0f0f5',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    };
  }

  const themeColor = parseThemeColor(color);
  return {
    backgroundColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.background,
    ),
    iconColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.icon,
    ),
    borderColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.border,
    ),
  };
};

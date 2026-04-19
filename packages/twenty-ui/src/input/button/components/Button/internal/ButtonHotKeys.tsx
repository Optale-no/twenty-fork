import { styled } from '@linaria/react';

import {
  type ButtonAccent,
  type ButtonSize,
  type ButtonVariant,
} from '@ui/input';
import { themeCssVariables } from '@ui/theme-constants';
import { getOsShortcutSeparator } from '@ui/utilities';

// Optale Orbital: on primary variants (solid bright bg: signal-green/gold),
// force void-black for WCAG-compliant contrast. Separator too.
const StyledSeparator = styled.div<{
  buttonSize: ButtonSize;
  accent: ButtonAccent;
  variant: ButtonVariant;
}>`
  background: ${({ accent, variant }) => {
    if (variant === 'primary') {
      return accent === 'danger'
        ? themeCssVariables.border.color.danger
        : themeCssVariables.background.primary;
    }
    switch (accent) {
      case 'blue':
        return themeCssVariables.buttons.secondaryTextColor;
      case 'danger':
        return themeCssVariables.border.color.danger;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  opacity: ${({ variant }) => (variant === 'primary' ? '0.55' : '1')};
  height: ${({ buttonSize }) =>
    buttonSize === 'small'
      ? themeCssVariables.spacing[2]
      : themeCssVariables.spacing[4]};
  margin: 0;
  width: 1px;
`;

const StyledShortcutLabel = styled.div<{
  variant: ButtonVariant;
  accent: ButtonAccent;
}>`
  color: ${({ variant, accent }) => {
    if (variant === 'primary') {
      return accent === 'danger'
        ? themeCssVariables.border.color.danger
        : themeCssVariables.background.primary;
    }
    switch (accent) {
      case 'blue':
        return themeCssVariables.buttons.secondaryTextColor;
      case 'danger':
        return themeCssVariables.color.red8;
      default:
        return themeCssVariables.font.color.light;
    }
  }};
  opacity: ${({ variant }) => (variant === 'primary' ? '0.75' : '1')};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const ButtonHotkeys = ({
  size,
  accent,
  variant,
  hotkeys,
}: {
  size: ButtonSize;
  accent: ButtonAccent;
  variant: ButtonVariant;
  hotkeys: string[];
}) => {
  return (
    <>
      <StyledSeparator buttonSize={size} accent={accent} variant={variant} />
      <StyledShortcutLabel variant={variant} accent={accent}>
        {hotkeys.join(getOsShortcutSeparator())}
      </StyledShortcutLabel>
    </>
  );
};

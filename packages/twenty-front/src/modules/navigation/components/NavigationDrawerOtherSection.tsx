import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconSettings, IconSitemap } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

import { ORM_APP_PATH } from '~/pages/orm/constants/OrmAppPath';

import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const NavigationDrawerOtherSection = () => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  const { toggleNavigationSection } = useNavigationSection('Other');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Other',
  );

  const handleSettingsClick = () => {
    navigateSettings(SettingsPath.ProfilePage);
  };

  return (
    <NavigationDrawerSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={t`Other`}
          onClick={toggleNavigationSection}
          isOpen={isNavigationSectionOpen}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      <AnimatedExpandableContainer
        isExpanded={isNavigationSectionOpen}
        dimension="height"
        mode="fit-content"
        containAnimation
        initial={false}
      >
        <NavigationDrawerItem
          label="ORM"
          secondaryLabel="Ontology"
          Icon={IconSitemap}
          to={ORM_APP_PATH}
          modifier="new"
        />
        <NavigationDrawerItem
          label={t`Settings`}
          Icon={IconSettings}
          onClick={handleSettingsClick}
        />
        {/* OPTALE FORK (OPT-1021): Documentation link to Twenty's docs hidden */}
      </AnimatedExpandableContainer>
    </NavigationDrawerSection>
  );
};

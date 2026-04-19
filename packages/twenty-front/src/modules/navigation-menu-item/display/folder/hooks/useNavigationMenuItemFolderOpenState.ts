import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { closedNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/closedNavigationMenuItemFolderIdsState';
import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { lastClickedNavigationMenuItemIdState } from '@/navigation-menu-item/common/states/lastClickedNavigationMenuItemIdState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type UseNavigationMenuItemFolderOpenStateParams = {
  folderId: string;
  folderChildrenNavigationMenuItems: NavigationMenuItem[];
};

export const useNavigationMenuItemFolderOpenState = ({
  folderId,
  folderChildrenNavigationMenuItems,
}: UseNavigationMenuItemFolderOpenStateParams) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const [openNavigationMenuItemFolderIds, setOpenNavigationMenuItemFolderIds] =
    useAtomState(openNavigationMenuItemFolderIdsState);
  const [
    closedNavigationMenuItemFolderIds,
    setClosedNavigationMenuItemFolderIds,
  ] = useAtomState(closedNavigationMenuItemFolderIdsState);
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();
  const setLastClickedNavigationMenuItemId = useSetAtomState(
    lastClickedNavigationMenuItemIdState,
  );

  const isExplicitlyOpen = openNavigationMenuItemFolderIds.includes(folderId);
  const isExplicitlyClosed =
    closedNavigationMenuItemFolderIds.includes(folderId);
  const hasActiveChild = folderChildrenNavigationMenuItems.some((item) =>
    activeNavigationMenuItemIds.includes(item.id),
  );
  // Optale Orbital: honor explicit user collapse even when hasActiveChild
  // (upstream auto-open trapped folders open while viewing their children).
  const isOpen = isExplicitlyClosed
    ? false
    : isExplicitlyOpen || hasActiveChild;

  const handleToggle = () => {
    if (isMobile) {
      setCurrentNavigationMenuItemFolderId((prev) =>
        prev === folderId ? null : folderId,
      );
    } else if (isOpen) {
      // Closing: mark explicitly closed, clear explicit-open
      setOpenNavigationMenuItemFolderIds((current) =>
        current.filter((id) => id !== folderId),
      );
      setClosedNavigationMenuItemFolderIds((current) =>
        current.includes(folderId) ? current : [...current, folderId],
      );
    } else {
      // Opening: mark explicitly open, clear explicit-closed
      setOpenNavigationMenuItemFolderIds((current) =>
        current.includes(folderId) ? current : [...current, folderId],
      );
      setClosedNavigationMenuItemFolderIds((current) =>
        current.filter((id) => id !== folderId),
      );
    }

    if (!isOpen) {
      const firstNonLinkItem = folderChildrenNavigationMenuItems.find(
        (item) => {
          if (item.type === NavigationMenuItemType.LINK) {
            return false;
          }
          const computedLink = getNavigationMenuItemComputedLink(
            item,
            objectMetadataItems,
            views,
          );
          return isNonEmptyString(computedLink);
        },
      );
      if (isDefined(firstNonLinkItem)) {
        const link = getNavigationMenuItemComputedLink(
          firstNonLinkItem,
          objectMetadataItems,
          views,
        );
        if (isNonEmptyString(link)) {
          setLastClickedNavigationMenuItemId(firstNonLinkItem.id);
          navigate(link);
        }
      }
    }
  };

  return {
    isOpen,
    handleToggle,
    hasActiveChild,
  };
};

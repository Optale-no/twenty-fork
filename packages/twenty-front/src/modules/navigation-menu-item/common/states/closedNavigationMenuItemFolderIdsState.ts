import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

/**
 * Optale Orbital fork: tracks folders the user has EXPLICITLY collapsed.
 *
 * Upstream Twenty auto-opens folders when a descendant page is active
 * (`hasActiveChild === true` forces `isOpen`), which means a user can never
 * manually collapse a section while they're viewing one of its pages. This
 * atom captures the user's explicit collapse intent so the hook can honor it.
 */
export const closedNavigationMenuItemFolderIdsState = createAtomState<string[]>(
  {
    key: 'closedNavigationMenuItemFolderIdsState',
    defaultValue: [],
  },
);

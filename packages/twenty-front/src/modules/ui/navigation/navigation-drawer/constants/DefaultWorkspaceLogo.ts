export const DEFAULT_WORKSPACE_LOGO =
  typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/optale-favicon.svg`
    : 'https://crm.optale.no/optale-favicon.svg';

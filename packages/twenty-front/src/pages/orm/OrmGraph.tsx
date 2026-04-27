import { styled } from '@linaria/react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconDatabase,
  IconGitBranch,
  IconHierarchy2,
  IconRefresh,
  IconSearch,
  IconSitemap,
} from 'twenty-ui/display';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { REACT_APP_OAG_API_BASE_URL, REACT_APP_ORM_GRAPH_URL } from '~/config';

type OagStatusPayload = {
  status?: string;
  service?: string;
  graph_name?: string;
  graph_nodes?: number;
  edges?: Record<string, number>;
};

type OagNode = {
  id: string;
  title?: string;
  type?: string;
  category?: string;
  status?: string;
  workflow_state?: string;
  vault_path?: string;
  bridges?: Record<string, unknown>;
};

type OagEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  fact?: string;
};

type OagGraphPayload = {
  graph?: {
    nodes?: OagNode[];
    edges?: OagEdge[];
  };
  meta?: {
    node_count?: number;
    edge_count?: number;
    relationship?: string;
  };
};

type OagContextPayload = {
  vault_matches?: Array<{
    docid?: string;
    file?: string;
    title?: string;
    score?: number;
    snippet?: string;
  }>;
  graph_context?: {
    nodes?: OagNode[];
    edges?: OagEdge[];
  };
  honcho_context?: unknown[];
  sources?: {
    qmd?: { ok?: boolean; error?: string | null };
    graphiti?: { ok?: boolean; graph?: string };
    honcho?: { ok?: boolean; error?: string | null };
  };
};

type OagLoadState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: string;
  statusPayload?: OagStatusPayload;
  graphPayload?: OagGraphPayload;
  contextPayload?: OagContextPayload;
};

const DEFAULT_QUERY = 'ontology';
const GRAPH_LIMIT = 80;

const StyledPage = styled.main`
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]} ${themeCssVariables.spacing[8]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding: ${themeCssVariables.spacing[4]};
  }
`;

const StyledHeader = styled.header`
  align-items: flex-start;
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) auto;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledEyebrow = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0;
  text-transform: uppercase;
`;

const StyledTitle = styled.h1`
  font-size: 30px;
  letter-spacing: 0;
  line-height: 1.15;
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  margin: 0;
  max-width: 860px;
`;

const StyledStatusPill = styled.div<{ variant: 'ready' | 'loading' | 'error' }>`
  align-items: center;
  background: ${({ variant }) =>
    variant === 'ready'
      ? themeCssVariables.color.green10
      : variant === 'error'
        ? themeCssVariables.color.red10
        : themeCssVariables.background.secondary};
  border: 1px solid
    ${({ variant }) =>
      variant === 'ready'
        ? themeCssVariables.color.green5
        : variant === 'error'
          ? themeCssVariables.color.red5
          : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.primary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  min-height: 32px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledGrid = styled.section`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
  min-height: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledPanelHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[5]};
`;

const StyledPanelTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  letter-spacing: 0;
  margin: 0;
`;

const StyledPanelDescription = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
  margin: ${themeCssVariables.spacing[1]} 0 0;
`;

const StyledPanelActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledIconButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    background: ${themeCssVariables.background.tertiary};
    color: ${themeCssVariables.font.color.primary};
  }

  &:disabled {
    cursor: progress;
    opacity: 0.65;
  }
`;

const StyledGraphFrame = styled.div`
  min-height: 520px;
  position: relative;
`;

const StyledIframe = styled.iframe`
  border: 0;
  height: 100%;
  min-height: 520px;
  width: 100%;
`;

const StyledGraphWorkbench = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 520px;
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledSearchBar = styled.form`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledInput = styled.input`
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  outline: 0;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSearchButton = styled.button`
  background: ${themeCssVariables.color.blue};
  border: 0;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-height: 30px;
  padding: 0 ${themeCssVariables.spacing[3]};

  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }
`;

const StyledGraphContent = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.65fr);
  min-height: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledNodeList = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledNodeCard = styled.article`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledNodeMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNodeTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.35;
  margin: 0;
`;

const StyledPath = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-break: anywhere;
`;

const StyledEdgeList = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  max-height: 420px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledEdgeItem = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
`;

const StyledEdgeType = styled.div`
  color: ${themeCssVariables.color.blue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledEdgeFact = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.45;
`;

const StyledMetrics = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledMetric = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMetricValue = styled.div`
  font-size: 26px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0;
`;

const StyledMetricLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledFlow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  padding: 0 ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[5]};
`;

const StyledFlowItem = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: auto minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFlowTitle = styled.div`
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledFlowText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  line-height: 1.45;
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledNotice = styled.div<{ variant?: 'warning' | 'error' }>`
  background: ${({ variant }) =>
    variant === 'error'
      ? themeCssVariables.color.red10
      : themeCssVariables.background.primary};
  border-top: 1px solid
    ${({ variant }) =>
      variant === 'error'
        ? themeCssVariables.color.red5
        : themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.secondary};
  line-height: 1.45;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[5]};
`;

const StyledSourceGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  padding: 0 ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[5]};
`;

const StyledSource = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmpty = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  min-height: 240px;
  text-align: center;
`;

const flowItems = [
  {
    Icon: IconDatabase,
    title: 'Vault ledger',
    text: 'Frontmatter owns identifiers, hierarchy, relationship fields, status, and bridge IDs.',
  },
  {
    Icon: IconGitBranch,
    title: 'Graph projection',
    text: 'FalkorDB carries parent, relates_to, and depends_on edges for traversal and validation.',
  },
  {
    Icon: IconHierarchy2,
    title: 'ORM workbench',
    text: 'Twenty exposes the operational surface for search, review, reconciliation, and action.',
  },
];

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString() : '--';

const trimBaseUrl = (url: string) => url.replace(/\/$/, '');

const buildOagUrl = (path: string) =>
  `${trimBaseUrl(REACT_APP_OAG_API_BASE_URL)}${path}`;

const fetchJson = async <T,>(path: string): Promise<T> => {
  const response = await fetch(buildOagUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OAG request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const bridgeCount = (node: OagNode) => Object.keys(node.bridges ?? {}).length;

export const OrmGraph = () => {
  const graphUrl = REACT_APP_ORM_GRAPH_URL.trim();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [loadState, setLoadState] = useState<OagLoadState>({ status: 'idle' });

  const loadOag = async (nextQuery = query) => {
    setLoadState((current) => ({
      ...current,
      status: 'loading',
      error: undefined,
    }));

    try {
      const [statusPayload, graphPayload, contextPayload] = await Promise.all([
        fetchJson<OagStatusPayload>('/api/oag/status'),
        fetchJson<OagGraphPayload>(`/api/oag/graph?limit=${GRAPH_LIMIT}`),
        fetchJson<OagContextPayload>(
          `/api/oag/context?query=${encodeURIComponent(nextQuery)}&limit=5`,
        ),
      ]);

      setLoadState({
        status: 'ready',
        statusPayload,
        graphPayload,
        contextPayload,
      });
    } catch (error) {
      setLoadState((current) => ({
        ...current,
        status: 'error',
        error: error instanceof Error ? error.message : 'OAG request failed',
      }));
    }
  };

  useEffect(() => {
    void loadOag(DEFAULT_QUERY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const graphNodes = useMemo(
    () =>
      loadState.contextPayload?.graph_context?.nodes?.length
        ? loadState.contextPayload.graph_context.nodes
        : (loadState.graphPayload?.graph?.nodes ?? []),
    [loadState.contextPayload, loadState.graphPayload],
  );

  const graphEdges = useMemo(
    () =>
      loadState.contextPayload?.graph_context?.edges?.length
        ? loadState.contextPayload.graph_context.edges
        : (loadState.graphPayload?.graph?.edges ?? []),
    [loadState.contextPayload, loadState.graphPayload],
  );

  const visibleNodes = graphNodes.slice(0, 8);
  const visibleEdges = graphEdges.slice(0, 12);
  const edgeCounts = loadState.statusPayload?.edges ?? {};
  const liveMetrics = [
    {
      value: formatNumber(loadState.statusPayload?.graph_nodes),
      label: 'Graph nodes',
    },
    {
      value: formatNumber(
        Object.values(edgeCounts).reduce((sum, count) => sum + count, 0),
      ),
      label: 'Graph edges',
    },
    { value: formatNumber(edgeCounts.parent), label: 'Parent edges' },
    { value: formatNumber(edgeCounts.depends_on), label: 'Depends on' },
  ];

  const sourceEntries = [
    ['QMD', loadState.contextPayload?.sources?.qmd?.ok],
    ['Graphiti', loadState.contextPayload?.sources?.graphiti?.ok],
    ['Honcho', loadState.contextPayload?.sources?.honcho?.ok],
  ] as const;

  const statusVariant =
    loadState.status === 'error'
      ? 'error'
      : loadState.status === 'ready'
        ? 'ready'
        : 'loading';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadOag(query.trim() || DEFAULT_QUERY);
  };

  return (
    <StyledPage>
      <StyledHeader>
        <div>
          <StyledEyebrow>Optale ORM</StyledEyebrow>
          <StyledTitle>Ontology Relationship Management</StyledTitle>
          <StyledSubtitle>
            Twenty is the operational CRM surface for the Optale ontology. OAG
            supplies context from QMD, Graphiti/FalkorDB, and Honcho while Vault
            remains the canonical ledger.
          </StyledSubtitle>
        </div>
        <StyledStatusPill variant={statusVariant}>
          {statusVariant === 'ready' ? (
            <IconCheck size={16} />
          ) : statusVariant === 'error' ? (
            <IconAlertCircle size={16} />
          ) : (
            <IconRefresh size={16} />
          )}
          {statusVariant === 'ready'
            ? `Live: ${loadState.statusPayload?.graph_name ?? 'OAG'}`
            : statusVariant === 'error'
              ? 'OAG unavailable'
              : 'Loading OAG'}
        </StyledStatusPill>
      </StyledHeader>

      <StyledGrid>
        <StyledPanel>
          <StyledPanelHeader>
            <div>
              <StyledPanelTitle>Ontology graph</StyledPanelTitle>
              <StyledPanelDescription>
                Search and inspect live relationship context.
              </StyledPanelDescription>
            </div>
            <StyledPanelActions>
              <StyledIconButton
                type="button"
                title="Refresh"
                aria-label="Refresh OAG data"
                disabled={loadState.status === 'loading'}
                onClick={() => void loadOag(query)}
              >
                <IconRefresh size={17} />
              </StyledIconButton>
              <IconSitemap size={24} stroke={1.8} />
            </StyledPanelActions>
          </StyledPanelHeader>
          <StyledGraphFrame>
            {graphUrl ? (
              <StyledIframe
                title="Optale ORM ontology graph"
                src={graphUrl}
                allow="clipboard-read; clipboard-write"
              />
            ) : (
              <StyledGraphWorkbench>
                <StyledSearchBar onSubmit={handleSubmit}>
                  <IconSearch size={18} />
                  <StyledInput
                    aria-label="Search ontology"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search ontology"
                  />
                  <StyledSearchButton disabled={loadState.status === 'loading'}>
                    Search
                  </StyledSearchButton>
                </StyledSearchBar>

                {visibleNodes.length === 0 && loadState.status !== 'loading' ? (
                  <StyledEmpty>No graph context returned.</StyledEmpty>
                ) : (
                  <StyledGraphContent>
                    <StyledNodeList>
                      {visibleNodes.map((node) => (
                        <StyledNodeCard key={node.id}>
                          <StyledNodeMeta>
                            <span>{node.type ?? 'entity'}</span>
                            {node.status && <span>{node.status}</span>}
                            {bridgeCount(node) > 0 && (
                              <span>{bridgeCount(node)} bridges</span>
                            )}
                          </StyledNodeMeta>
                          <StyledNodeTitle>
                            {node.title ?? node.id}
                          </StyledNodeTitle>
                          {node.vault_path && (
                            <StyledPath>{node.vault_path}</StyledPath>
                          )}
                        </StyledNodeCard>
                      ))}
                    </StyledNodeList>

                    <StyledEdgeList>
                      {visibleEdges.map((edge) => (
                        <StyledEdgeItem key={edge.id}>
                          <StyledEdgeType>{edge.type}</StyledEdgeType>
                          <StyledEdgeFact>
                            {edge.fact ?? `${edge.source} -> ${edge.target}`}
                          </StyledEdgeFact>
                        </StyledEdgeItem>
                      ))}
                    </StyledEdgeList>
                  </StyledGraphContent>
                )}
              </StyledGraphWorkbench>
            )}
          </StyledGraphFrame>
          {!graphUrl && loadState.status === 'error' && (
            <StyledNotice variant="error">{loadState.error}</StyledNotice>
          )}
        </StyledPanel>

        <StyledPanel>
          <StyledPanelHeader>
            <div>
              <StyledPanelTitle>OAG boundary</StyledPanelTitle>
              <StyledPanelDescription>
                Live context status for the ORM surface.
              </StyledPanelDescription>
            </div>
          </StyledPanelHeader>
          <StyledMetrics>
            {liveMetrics.map((metric) => (
              <StyledMetric key={metric.label}>
                <StyledMetricValue>{metric.value}</StyledMetricValue>
                <StyledMetricLabel>{metric.label}</StyledMetricLabel>
              </StyledMetric>
            ))}
          </StyledMetrics>
          <StyledSourceGrid>
            {sourceEntries.map(([name, ok]) => (
              <StyledSource key={name}>
                {ok ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                {name}
              </StyledSource>
            ))}
          </StyledSourceGrid>
          <StyledFlow>
            {flowItems.map(({ Icon, title, text }) => (
              <StyledFlowItem key={title}>
                <Icon size={22} stroke={1.8} />
                <div>
                  <StyledFlowTitle>{title}</StyledFlowTitle>
                  <StyledFlowText>{text}</StyledFlowText>
                </div>
              </StyledFlowItem>
            ))}
          </StyledFlow>
        </StyledPanel>
      </StyledGrid>
    </StyledPage>
  );
};

export type LinkId = `${string}->${string}`
export type SourceReference = { readonly documentId: string; readonly passage: string } & (
  { readonly status: 'available'; readonly text: string } |
  { readonly status: 'unavailable'; readonly reason: string })
export interface Claim { readonly id: string; readonly text: string; readonly documentIds: readonly string[]; readonly linkIds: readonly LinkId[]; readonly sources: readonly SourceReference[]; readonly support: 'supported' | 'unknown' }
export interface Findings { readonly agreement: readonly Claim[]; readonly conflict: readonly Claim[]; readonly assumptions: readonly Claim[]; readonly unknowns: readonly Claim[] }
export interface QueryInput { readonly question: string; readonly focus: string; readonly documentIds: readonly string[] }
export interface Query extends QueryInput { readonly id: string; readonly linkIds: readonly LinkId[] }
export interface Analysis extends Findings { readonly queryId: string }
export type Agent = 'Finance' | 'Risk' | 'Operations' | 'Challenger'
export interface RoomStep { readonly agent: Agent; readonly text: string; readonly documentIds: readonly string[]; readonly sources: readonly SourceReference[] }
export interface RoomResult { readonly agreement: readonly Claim[]; readonly disagreement: readonly Claim[]; readonly missingEvidence: readonly Claim[]; readonly assumptions: readonly Claim[]; readonly reasoningSummary: string; readonly sources: readonly SourceReference[] }
export interface StageCase { readonly id: string; readonly question: string; readonly focus: string; readonly documentIds: readonly string[]; readonly linkIds: readonly LinkId[]; readonly sources: readonly SourceReference[]; readonly analysis: Findings; readonly room: { readonly scenario: string; readonly steps: readonly [RoomStep, RoomStep, RoomStep, RoomStep]; readonly result: RoomResult }; readonly metadata: ExportMetadata }
export interface RoomRun { readonly id: string; readonly queryId: string; readonly startedAt: number; readonly status: 'running' | 'complete'; readonly completedSteps: number; readonly result: RoomResult | null; readonly disagreementOpened: boolean; readonly prepared: boolean }
export type MetadataValue = { readonly status: 'available'; readonly value: string } | { readonly status: 'unavailable'; readonly reason: string }
export interface ExportMetadata { readonly confidence: MetadataValue; readonly freshness: MetadataValue; readonly modelLabel: string; readonly scriptedLabel: string }
export interface ExportSnapshot { readonly query: Query; readonly analysis: Analysis; readonly run: RoomRun; readonly claims: readonly Claim[]; readonly evidenceSummary: string; readonly assumptions: readonly Claim[]; readonly unknowns: readonly Claim[]; readonly reasoningSummary: string; readonly sources: readonly SourceReference[]; readonly metadata: ExportMetadata }
export interface StageState { readonly query: Query | null; readonly analysis: Analysis | null; readonly run: RoomRun | null; readonly snapshot: ExportSnapshot | null }
export type StagePage = 'brain' | 'query' | 'room' | 'export'
export interface PageCallbacks { onNavigate(page: StagePage): void; onCreate(input: QueryInput): void; onGenerateAnalysis(): void; onOpenSource(source: SourceReference): void; onInspectDocument(documentId: string): void; onInspectLink(linkId: LinkId): void; onStartRun(): void; onOpenDisagreement(runId: string): void; onPrepare(runId: string): void; onDownload(snapshot: ExportSnapshot): void }
export interface StagePageProps { readonly state: StageState; readonly stageCase: StageCase; readonly callbacks: PageCallbacks }
export interface SuppliedDocument { readonly id: string; readonly links: readonly { readonly targetId: string }[] }

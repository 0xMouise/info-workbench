import type { ActivityRow, JsonRecord, WorkspaceData, WorkspaceState } from "./types.js";
export declare class RevisionConflictError extends Error {
    readonly current: WorkspaceState;
    constructor(current: WorkspaceState);
}
interface OperationResult<T> {
    duplicate: boolean;
    revision: number;
    result: T;
}
export declare class WorkbenchDatabase {
    private readonly db;
    constructor(file?: string);
    private migrate;
    close(): void;
    getRevision(): number;
    getWorkspace(): WorkspaceState;
    saveWorkspace(dataValue: unknown, settingsValue: unknown, expectedRevision: number, source?: string): WorkspaceState;
    runOperation<T extends JsonRecord>(operationId: string, kind: string, source: string, mutate: (data: WorkspaceData) => {
        result: T;
        message: string;
        scanRun?: {
            run_id: string;
            agent: string;
            tool: string;
            target_id: string;
            scanned_at: string;
            card_count: number;
            metadata: JsonRecord;
        };
    }): OperationResult<T>;
    private persistWorkspace;
    private insertActivity;
    listActivity(limit?: number, offset?: number): {
        total_count: number;
        items: ActivityRow[];
    };
    listRuns(limit?: number, offset?: number, tool?: string): {
        total_count: number;
        items: JsonRecord[];
    };
    searchCards(query: string, targetId: string, risk: string, tag: string, limit: number, offset: number): {
        total_count: number;
        items: JsonRecord[];
    };
}
export {};

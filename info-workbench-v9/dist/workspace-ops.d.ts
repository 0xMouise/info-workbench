import type { Card, CardWrite, Connection, SourceInfo, Target, WorkspaceData } from "./types.js";
export declare function emptyWorkspace(): WorkspaceData;
export declare function normalizeWorkspace(value: unknown): WorkspaceData;
export declare function createTarget(data: WorkspaceData, targetId: string, name: string): Target;
export declare function mergeLineContent(current: string, incoming: string, mode: CardWrite["write_mode"]): string;
export declare function upsertCards(data: WorkspaceData, targetId: string, source: SourceInfo, writes: CardWrite[]): {
    target: Target;
    cards: Card[];
};
export declare function addConnection(data: WorkspaceData, targetId: string, fromKey: string, toKey: string, type: string, operationId: string): Connection;

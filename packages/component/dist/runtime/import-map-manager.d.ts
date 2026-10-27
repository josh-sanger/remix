interface ImportMapManager {
    readonly nonce: string | undefined;
    consumeImportMaps(source: ParentNode): 'ready' | 'conflict' | 'blocked';
    disconnect(): void;
    shouldPreserveHeadNode(node: Node): boolean;
}
export declare function getDocumentImportMapManager(doc: Document): ImportMapManager;
export declare function resetDocumentImportMapManager(doc: Document): void;
export {};

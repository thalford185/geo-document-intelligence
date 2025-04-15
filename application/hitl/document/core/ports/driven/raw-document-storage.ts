export default interface RawDocumentStorage {
  createUrl(id: string): Promise<string | null>;
}

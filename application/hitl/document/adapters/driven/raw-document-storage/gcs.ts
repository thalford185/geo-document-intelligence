import RawDocumentStorage from "@/document/core/ports/driven/raw-document-storage";
import { Storage } from "@google-cloud/storage";
import { GoogleAuth } from "google-auth-library";

export default class GcsRawDocumentStorage implements RawDocumentStorage {
  constructor(
    private authClient: GoogleAuth,
    private bucketName: string,
  ) {}

  async createUrl(id: string): Promise<string | null> {
    const storage = new Storage({ authClient: this.authClient });
    const file = storage.bucket(this.bucketName).file(`${id}.pdf`);
    if (await file.exists()) {
      const [url] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });
      return url;
    } else {
      return null;
    }
  }
}

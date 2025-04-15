import {
  Boundary,
  DocumentRegion,
  PartialBoundary,
} from "@/document/core/model";
import RawDocumentAi from "@/document/core/ports/driven/raw-document-ai";
import { IAMCredentialsClient } from "@google-cloud/iam-credentials";
import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { z } from "zod";

const boundariesDtoSchema = z.array(
  z.object({
    normalized_vertices: z.array(z.tuple([z.number(), z.number()])),
  })
);
const partialBoundariesDtoSchema = z.array(
  z.object({
    normalized_vertices: z.array(z.tuple([z.number(), z.number()])),
  })
);

export default class CloudRunRawDocumentAi implements RawDocumentAi {
  constructor(
    private authClient: GoogleAuth,
    private serviceAccountEmail: string,
    private serviceUri: string
  ) {}
  private async getIdToken(): Promise<string> {
    const iamCredentialsClient = new IAMCredentialsClient({
      auth: this.authClient,
    });
    const generateIdTokenResult = await iamCredentialsClient.generateIdToken({
      name: `projects/-/serviceAccounts/${this.serviceAccountEmail}`,
      audience: this.serviceUri,
    });
    return generateIdTokenResult[0].token!;
  }
  async getBoundary(
    rawDocumentId: string,
    documentRegion: DocumentRegion
  ): Promise<Boundary | null> {
    const idToken = await this.getIdToken();
    const url = `${this.serviceUri}/raw-documents/${rawDocumentId}/object-boundaries`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      params: {
        page_number: documentRegion.pageNumber,
        normalized_bounding_box: JSON.stringify(
          documentRegion.normalizedBoundingBox
        ),
      },
    });
    const boundariesDto = boundariesDtoSchema.parse(response.data);
    if (boundariesDto.length > 0) {
      return {
        normalizedVertices: boundariesDto[0].normalized_vertices || [],
      };
    } else {
      return null;
    }
  }
  async completeBoundary(
    rawDocumentId: string,
    documentRegion: DocumentRegion,
    partialBoundary: PartialBoundary
  ): Promise<PartialBoundary | null> {
    const idToken = await this.getIdToken();
    const url = `${this.serviceUri}/raw-documents/${rawDocumentId}/object-boundaries`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      params: {
        page_number: documentRegion.pageNumber,
        normalized_bounding_box: JSON.stringify(
          documentRegion.normalizedBoundingBox
        ),
        partial_boundary_normalized_vertices: JSON.stringify(
          partialBoundary.normalizedVertices
        ),
      },
      paramsSerializer: {
        indexes: null,
      },
    });
    const partialBoundariesDto = partialBoundariesDtoSchema.parse(
      response.data
    );
    if (partialBoundariesDto.length > 0) {
      return {
        normalizedVertices: partialBoundariesDto[0].normalized_vertices || [],
      };
    } else {
      return null;
    }
  }
}

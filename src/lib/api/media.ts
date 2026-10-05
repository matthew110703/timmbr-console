import { api, API_ROUTES } from "@/lib/api";

export interface PresignedUrlItem {
  fileName: string;
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}

export interface GeneratePresignedUrlsResponse {
  files: PresignedUrlItem[];
}

export interface FileUploadPayload {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UploadMediaResult {
  url: string;
  key: string;
}

export const mediaApi = {
  /**
   * Requests S3 presigned upload URL(s) from timmbr-core backend.
   */
  getPresignedUrls: async (
    folder: string,
    files: FileUploadPayload[],
  ): Promise<GeneratePresignedUrlsResponse> => {
    return api.post<GeneratePresignedUrlsResponse>(
      API_ROUTES.MEDIA.PRESIGNED_URL,
      {
        folder,
        files,
      },
    );
  },

  /**
   * Uploads binary file stream directly to S3 via presigned PUT URL.
   */
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    if (!res.ok) {
      throw new Error(`Direct S3 upload failed with status ${res.status}`);
    }
  },

  /**
   * Deletes a media file from storage by key.
   */
  deleteMedia: async (key: string): Promise<void> => {
    await api.delete(API_ROUTES.MEDIA.ROOT, {
      params: { key },
    });
  },

  /**
   * Complete high-level upload orchestrator:
   * 1. Obtains presigned URL for the given folder
   * 2. Directly streams file to S3
   * 3. Returns public CDN URL and S3 key
   */
  uploadMedia: async (
    file: File,
    folder = "categories",
  ): Promise<UploadMediaResult> => {
    const presignedData = await mediaApi.getPresignedUrls(folder, [
      {
        fileName: file.name,
        mimeType: file.type || "image/png",
        sizeBytes: file.size,
      },
    ]);

    const item = presignedData.files?.[0];
    if (!item?.uploadUrl) {
      throw new Error("Failed to receive presigned upload URL from server");
    }

    await mediaApi.uploadToS3(item.uploadUrl, file);

    return {
      url: item.publicUrl,
      key: item.key,
    };
  },
};

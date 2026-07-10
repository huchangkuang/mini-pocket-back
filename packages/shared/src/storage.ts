export type PersistScope = "feedback" | "general";

export type ApiUploadResult = {
  ossKey: string;
  url: string;
  mimeType: string;
};

export type ApiPersistedFile = {
  ossKey: string;
  url: string;
  sourceOssKey: string;
};

export type ApiPersistStorageResult = {
  files: ApiPersistedFile[];
};

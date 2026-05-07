import type { MultipartPolicy } from "../types";
import { MultipartPolicyEnum } from "../types";

interface FileEntry {
  path: string;
  file: File | Blob;
}

function collectFiles(obj: unknown, path = ""): FileEntry[] {
  if (obj instanceof File || obj instanceof Blob) {
    return [{ path, file: obj }];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, i) =>
      collectFiles(item, path ? `${path}.${i}` : String(i)),
    );
  }
  if (obj !== null && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).flatMap(
      ([key, val]) => collectFiles(val, path ? `${path}.${key}` : key),
    );
  }
  return [];
}

function toFormData(obj: Record<string, unknown>): FormData {
  const files = collectFiles(obj);
  const fd = new FormData();
  // JSON.stringify naturally drops File/Blob — used as the plain-data field
  fd.append("data", JSON.stringify(obj));
  for (const { path, file } of files) {
    fd.append(path, file);
  }
  return fd;
}

export function applyMultipartPolicy(
  payload: Record<string, unknown>,
  policy: MultipartPolicy,
): FormData | Record<string, unknown> {
  if (policy === MultipartPolicyEnum.Disable) return payload;
  if (policy === MultipartPolicyEnum.Force) return toFormData(payload);
  // auto: transform only if File/Blob are present
  return collectFiles(payload).length > 0 ? toFormData(payload) : payload;
}

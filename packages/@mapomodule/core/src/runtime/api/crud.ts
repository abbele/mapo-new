import { normalizeEndpoint } from "@mapomodule/utils";
import { applyMultipartPolicy } from "./multipart";
import { useMapoFetch } from "../utils/useMapoFetch";
import { MultipartPolicyEnum } from "../types";
import type {
  ListParams,
  PaginatedResponse,
  CrudConfig,
  CrudOptions,
  CrudRepository,
} from "../types";

export function useCrud<T>(
  endpoint: string,
  higherConf?: CrudConfig,
): CrudRepository<T> {
  const base = normalizeEndpoint(endpoint);

  function merged(local?: CrudConfig): Record<string, unknown> {
    return { ...higherConf, ...local };
  }

  function fetch<R>(
    path: string,
    options: Record<string, unknown>,
  ): Promise<R> {
    return useMapoFetch()(
      path,
      options as Parameters<ReturnType<typeof useMapoFetch>>[1],
    ) as Promise<R>;
  }

  return {
    list(params, config) {
      return fetch<PaginatedResponse<T>>(base, {
        method: "GET",
        params,
        ...merged(config),
      });
    },

    detail(id, config) {
      return fetch<T>(`${base}${id}/`, { method: "GET", ...merged(config) });
    },

    create(data, config, opts: CrudOptions = {}) {
      const body = applyMultipartPolicy(
        data as Record<string, unknown>,
        opts.multipart ?? MultipartPolicyEnum.Auto,
      );
      return fetch<T>(base, { method: "POST", body, ...merged(config) });
    },

    update(id, data, config, opts: CrudOptions = {}) {
      const body = applyMultipartPolicy(
        data as Record<string, unknown>,
        opts.multipart ?? MultipartPolicyEnum.Auto,
      );
      return fetch<T>(`${base}${id}/`, {
        method: "PUT",
        body,
        ...merged(config),
      });
    },

    partialUpdate(id, diff, config, opts: CrudOptions = {}) {
      const body = applyMultipartPolicy(
        diff as Record<string, unknown>,
        opts.multipart ?? MultipartPolicyEnum.Auto,
      );
      return fetch<T>(`${base}${id}/`, {
        method: "PATCH",
        body,
        ...merged(config),
      });
    },

    delete(id, config) {
      return fetch<void>(`${base}${id}/`, {
        method: "DELETE",
        ...merged(config),
      });
    },

    updateOrCreate(data, config, opts) {
      if (data.id) {
        const { id, ...rest } = data;
        return this.update(id, rest as Partial<T>, config, opts);
      }
      return this.create(data as Partial<T>, config, opts);
    },

    updateOrder(startId, endId, config) {
      return fetch<void>(`${base}update_order/`, {
        method: "POST",
        body: { startId, endId },
        ...merged(config),
      });
    },
  };
}

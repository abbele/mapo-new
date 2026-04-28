import { useSnackStore } from "@mapomodule/store/runtime/stores/snack";
import { useConfirmStore } from "@mapomodule/store/runtime/stores/confirm";
import { useMapoAuth } from "../auth/useMapoAuth";
import { useCrud } from "../api/crud";
import type { MapoOptions } from "../../types";
import type { CrudRepository } from "../types";

export interface MapoApiLayer {
  crud<T>(endpoint: string): CrudRepository<T>;
}

export interface MapoFacade {
  $api: MapoApiLayer;
  $auth: ReturnType<typeof useMapoAuth>;
  $snack: ReturnType<typeof useSnackStore>;
  $confirm: ReturnType<typeof useConfirmStore>;
  $options: MapoOptions;
}

export function useMapo(options: MapoOptions = {}): MapoFacade {
  return {
    $api: {
      crud: <T>(endpoint: string): CrudRepository<T> => useCrud<T>(endpoint),
    },
    $auth: useMapoAuth(options),
    $snack: useSnackStore(),
    $confirm: useConfirmStore(),
    $options: options,
  };
}

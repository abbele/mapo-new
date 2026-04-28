import { useNuxtApp } from "nuxt/app";
import type { $Fetch } from "ofetch";

// $mapoFetch is provided at runtime by the mapomodule plugin via $fetch.create()
export function useMapoFetch(): $Fetch {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useNuxtApp() as any).$mapoFetch as $Fetch;
}

export const mapoVersion = "2.0.0-alpha";

export function useMapo() {
  console.log("[mapo] useMapo() initialized — v2 core running");
  return { version: mapoVersion };
}

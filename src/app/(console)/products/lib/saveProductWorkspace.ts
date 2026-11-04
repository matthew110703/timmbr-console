import type { ProductWorkspaceTab } from "../types";

export type TabSaveHandler = () => Promise<boolean>;

const TAB_ORDER: ProductWorkspaceTab[] = [
  "info",
  "attributes",
  "variants",
  "media",
  "inventory",
];

export async function saveDirtyTabs(
  dirtyTabs: Partial<Record<ProductWorkspaceTab, boolean>>,
  handlers: Partial<Record<ProductWorkspaceTab, TabSaveHandler>>,
): Promise<{ ok: boolean; failedTab?: ProductWorkspaceTab }> {
  for (const tab of TAB_ORDER) {
    if (!dirtyTabs[tab]) continue;
    const handler = handlers[tab];
    if (!handler) continue;
    const ok = await handler();
    if (!ok) {
      return { ok: false, failedTab: tab };
    }
  }
  return { ok: true };
}

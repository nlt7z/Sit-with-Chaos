export const PROTOTYPE_ROUTES = [
  { path: "/prototype/search", label: "搜索结果", step: 1 },
  { path: "/prototype/diagnosis-start", label: "精准报价引导", step: 2 },
  { path: "/prototype/diagnosis", label: "引导式诊断", step: 3 },
  { path: "/prototype/chat", label: "结构化IM", step: 4 },
  { path: "/prototype/matching", label: "实时报价", step: 5 },
  { path: "/prototype/quotes", label: "报价对比", step: 6 },
  { path: "/prototype/booking", label: "预约确认", step: 7 },
  { path: "/prototype/expired", label: "报价过期", step: 8 },
] as const;

export type PrototypePath = (typeof PROTOTYPE_ROUTES)[number]["path"];

export function getNextRoute(currentPath: string): string | null {
  const idx = PROTOTYPE_ROUTES.findIndex((r) => r.path === currentPath);
  if (idx === -1 || idx === PROTOTYPE_ROUTES.length - 1) return null;
  return PROTOTYPE_ROUTES[idx + 1].path;
}

export function getPrevRoute(currentPath: string): string | null {
  const idx = PROTOTYPE_ROUTES.findIndex((r) => r.path === currentPath);
  if (idx <= 0) return null;
  return PROTOTYPE_ROUTES[idx - 1].path;
}

export function getRouteInfo(path: string) {
  return PROTOTYPE_ROUTES.find((r) => r.path === path) ?? null;
}

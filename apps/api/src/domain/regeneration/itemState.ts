export interface ItemState {
  origin: "generated" | "user";
  edited: boolean;
  pinned: boolean;
  updatedAt: string;
}

export function isItemProtected(item: ItemState): boolean {
  if (item.origin === "user") return true;
  if (item.edited) return true;
  if (item.pinned) return true;
  return false;
}

export function countKeptAndReplaced(items: ItemState[]): { kept: number; replaced: number } {
  let kept = 0;
  for (const item of items) {
    if (isItemProtected(item)) {
      kept++;
    }
  }
  return {
    kept,
    replaced: items.length - kept
  };
}

export function markUserItem<T extends object>(data: T): T & ItemState {
  return {
    ...data,
    origin: "user",
    edited: false,
    pinned: false,
    updatedAt: new Date().toISOString()
  };
}

export function markEdited<T extends ItemState>(item: T, updates: Partial<T>): T {
  return {
    ...item,
    ...updates,
    edited: true,
    updatedAt: new Date().toISOString()
  };
}

export function togglePinned<T extends ItemState>(item: T): T {
  return {
    ...item,
    pinned: !item.pinned,
    updatedAt: new Date().toISOString()
  };
}

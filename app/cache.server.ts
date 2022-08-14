import type { AccountsView } from "./models/accounts.server";
import type { LedgerLine } from "./models/ledger-lines.server";

// TODO move to Redis at some point
type InternalCache = {
  accountsViewByUser: Map<string, AccountsView>;
  ledgerLinesByUserAndAccount: Map<string, LedgerLine[]>;
};

let internalCache: InternalCache;

declare global {
  var __internalCache__: InternalCache;
}

// same approach as in db.server.ts to avoid re-initializing the object on each request
if (process.env.NODE_ENV === "production") {
  internalCache = getAppCache();
} else {
  if (!global.__internalCache__) {
    global.__internalCache__ = getAppCache();
  }
  internalCache = global.__internalCache__;
}

function getAppCache(): InternalCache {
  return {
    accountsViewByUser: new Map<string, AccountsView>(),
    ledgerLinesByUserAndAccount: new Map<string, LedgerLine[]>(),
  };
}

function invalidate(userId: string, accountIds: string[]) {
  internalCache.accountsViewByUser.delete(userId);

  for (const accountId of accountIds) {
    internalCache.ledgerLinesByUserAndAccount.delete(`${userId}.${accountId}`);
  }
}

export const cache = {
  invalidate,
  accountsView: {
    read(userId: string) {
      return internalCache.accountsViewByUser.get(userId);
    },
    write(userId: string, accountsView: AccountsView) {
      internalCache.accountsViewByUser.set(userId, accountsView);
    },
  },
  ledgerLines: {
    read(userId: string, accountId: string) {
      return internalCache.ledgerLinesByUserAndAccount.get(
        `${userId}.${accountId}`
      );
    },
    write(userId: string, accountId: string, ledgerLines: LedgerLine[]) {
      internalCache.ledgerLinesByUserAndAccount.set(
        `${userId}.${accountId}`,
        ledgerLines
      );
    },
  },
};

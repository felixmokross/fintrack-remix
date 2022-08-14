import type { CurrencyFormatStyle } from "./formatting.server";
import type { AccountsView } from "./models/accounts.server";
import type { LedgerLine } from "./models/ledger-lines.server";

// TODO move to Redis at some point (at least more important data)
type InternalCache = {
  accountsView: Map<string, AccountsView>;
  ledgerLines: Map<string, LedgerLine[]>;
  currencyFormat: Map<string, Intl.NumberFormat>;
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
    accountsView: new Map<string, AccountsView>(),
    ledgerLines: new Map<string, LedgerLine[]>(),
    currencyFormat: new Map<string, Intl.NumberFormat>(),
  };
}

function invalidate(userId: string, accountIds: string[]) {
  internalCache.accountsView.delete(userId);

  for (const accountId of accountIds) {
    internalCache.ledgerLines.delete(`${userId}.${accountId}`);
  }
}

export const cache = {
  invalidate,
  accountsView: {
    read(userId: string) {
      return internalCache.accountsView.get(userId);
    },
    write(userId: string, accountsView: AccountsView) {
      internalCache.accountsView.set(userId, accountsView);
    },
  },
  ledgerLines: {
    read(userId: string, accountId: string) {
      return internalCache.ledgerLines.get(ledgerLinesKey(userId, accountId));
    },
    write(userId: string, accountId: string, ledgerLines: LedgerLine[]) {
      internalCache.ledgerLines.set(
        ledgerLinesKey(userId, accountId),
        ledgerLines
      );
    },
  },
  currencyFormat: {
    read(locale: string, currency: string, style: CurrencyFormatStyle) {
      return internalCache.currencyFormat.get(
        currencyFormatKey(locale, currency, style)
      );
    },
    write(
      locale: string,
      currency: string,
      style: CurrencyFormatStyle,
      currencyFormat: Intl.NumberFormat
    ) {
      internalCache.currencyFormat.set(
        currencyFormatKey(locale, currency, style),
        currencyFormat
      );
    },
  },
};

function ledgerLinesKey(userId: string, accountId: string) {
  return key(userId, accountId);
}

function currencyFormatKey(
  locale: string,
  currency: string,
  style: CurrencyFormatStyle
) {
  return key(locale, currency, style);
}

function key(...keyItems: string[]) {
  return keyItems.join(".");
}

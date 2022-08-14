import type { AccountsView } from "./models/accounts.server";

// TODO move to Redis at some point
type AppCache = {
  accountsViewByUser: Map<string, AccountsView>;
};

let appCache: AppCache;

declare global {
  var __appCache__: AppCache;
}

// same approach as in db.server.ts to avoid re-initializing the object on each request
if (process.env.NODE_ENV === "production") {
  appCache = getAppCache();
} else {
  if (!global.__appCache__) {
    global.__appCache__ = getAppCache();
  }
  appCache = global.__appCache__;
}

function getAppCache(): AppCache {
  return { accountsViewByUser: new Map<string, AccountsView>() };
}

export { appCache };

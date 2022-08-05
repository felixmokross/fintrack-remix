import { MongoClient } from "mongodb";

// see https://github.com/vercel/next.js/blob/canary/examples/with-mongodb/lib/mongodb.js
const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb() {
  return (await clientPromise).db("fintrack");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

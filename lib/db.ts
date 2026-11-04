import dns from "node:dns";
import mongoose from "mongoose";

// Ensure Node.js c-ares DNS resolver uses reliable public DNS servers for MongoDB Atlas SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Fail-safe for restricted environments
}

/**
 * Cache interface to maintain connection pool across
 * hot serverless invocations in Vercel Node.js runtime.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongoose) {
  globalThis.mongoose = cached;
}

// In-memory DNS cache to accelerate replica set shard resolution
const dnsCache = new Map<string, string[]>();

/**
 * Fast DNS lookup helper that resolves IPv4 directly using Node.js c-ares resolver,
 * avoiding system getaddrinfo timeouts when dead IPv6/private nameservers are present.
 */
function fastLookup(
  hostname: string,
  options: dns.LookupOptions | unknown,
  callback: (err: NodeJS.ErrnoException | null, address: unknown, family?: number) => void,
) {
  const cb = typeof options === "function" ? (options as typeof callback) : callback;
  const opts = typeof options === "object" && options !== null ? (options as dns.LookupOptions) : {};

  if (dnsCache.has(hostname)) {
    const addresses = dnsCache.get(hostname)!;
    if (opts.all) {
      return cb(null, addresses.map((ip) => ({ address: ip, family: 4 })));
    }
    return cb(null, addresses[0], 4);
  }

  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, opts, cb);
    }
    dnsCache.set(hostname, addresses);
    if (opts.all) {
      cb(null, addresses.map((ip) => ({ address: ip, family: 4 })));
    } else {
      cb(null, addresses[0], 4);
    }
  });
}

/**
 * Connects to MongoDB Atlas using a cached singleton connection.
 * Prevents exhausting database connection pool during viral traffic spikes
 * in standard Node.js serverless functions.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing environment variable: Please define MONGODB_URI in your environment or .env file",
    );
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      lookup: fastLookup as unknown as mongoose.ConnectOptions["lookup"],
    };

    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {}

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;

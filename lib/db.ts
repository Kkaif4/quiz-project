import mongoose from "mongoose";

/**
 * Cache interface to maintain connection pool across
 * hot serverless invocations in development, production lambdas, and Cloudflare Workers.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongoose ?? {
  conn: null,
  promise: null,
};

if (!globalThis.mongoose) {
  globalThis.mongoose = cached;
}

let cachedResolvedUri: string | null = null;

/**
 * Resolves a mongodb+srv:// connection URI into a direct mongodb:// connection string
 * with explicit replica set seed list and SSL options via DNS-over-HTTPS (DoH).
 * 
 * Cloudflare Workers (workerd) and edge isolate environments do not implement native Node.js
 * `dns.resolveSrv`. This function queries Cloudflare and Google DoH over standard HTTPS fetch,
 * allowing Mongoose to connect directly to Atlas replica sets without failing SRV lookups.
 */
export async function resolveMongoSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  if (cachedResolvedUri) {
    console.log("[DB:DoH] Using in-memory cached resolved MongoDB URI.");
    return cachedResolvedUri;
  }

  try {
    const dummy = new URL(uri.replace(/^mongodb\+srv:\/\//, "http://"));
    const auth = dummy.username ? `${dummy.username}:${dummy.password}@` : "";
    const host = dummy.hostname;
    const path = dummy.pathname || "/";
    const params = new URLSearchParams(dummy.search);

    console.log(`[DB:DoH] Starting DoH resolution for cluster host: ${host}`);

    // 1. Resolve SRV records for _mongodb._tcp.<host> via DoH
    let srvData: { Answer?: Array<{ data: string }> } | null = null;
    const srvEndpoints = [
      `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${encodeURIComponent(host)}&type=SRV`,
      `https://dns.google/resolve?name=_mongodb._tcp.${encodeURIComponent(host)}&type=SRV`,
    ];

    for (const ep of srvEndpoints) {
      try {
        console.log(`[DB:DoH] Fetching SRV records from ${ep.split("?")[0]}...`);
        const res = await fetch(ep, {
          headers: { Accept: "application/dns-json" },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.Answer && json.Answer.length > 0) {
            srvData = json;
            console.log(`[DB:DoH] Successfully received ${json.Answer.length} SRV records.`);
            break;
          }
        }
      } catch (err) {
        console.warn(`[DB:DoH] DoH SRV query failed for endpoint ${ep.split("?")[0]}:`, err);
      }
    }

    if (!srvData || !srvData.Answer || srvData.Answer.length === 0) {
      console.warn("[DB:DoH] Could not resolve MongoDB SRV via DoH. Falling back to provided URI.");
      return uri;
    }

    const hosts = srvData.Answer.map((ans) => {
      const parts = ans.data.trim().split(/\s+/);
      const port = parts[2];
      const target = parts[3].replace(/\.$/, "");
      return `${target}:${port}`;
    });
    console.log(`[DB:DoH] Resolved MongoDB replica shard hosts: ${hosts.join(", ")}`);

    // 2. Resolve TXT records for <host> via DoH (e.g. replicaSet, authSource)
    let txtData: { Answer?: Array<{ data: string }> } | null = null;
    const txtEndpoints = [
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=TXT`,
      `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`,
    ];

    for (const ep of txtEndpoints) {
      try {
        const res = await fetch(ep, {
          headers: { Accept: "application/dns-json" },
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (json.Answer && json.Answer.length > 0) {
            txtData = json;
            console.log("[DB:DoH] Successfully received TXT configuration records.");
            break;
          }
        }
      } catch (err) {
        console.warn(`[DB:DoH] DoH TXT query failed for endpoint ${ep.split("?")[0]}:`, err);
      }
    }

    if (txtData && txtData.Answer) {
      for (const ans of txtData.Answer) {
        const cleanData = ans.data.replace(/^"|"$/g, "");
        const txtParams = new URLSearchParams(cleanData);
        for (const [k, v] of txtParams.entries()) {
          if (!params.has(k)) {
            params.set(k, v);
          }
        }
      }
    }

    // Atlas SRV connections always enforce SSL/TLS
    if (!params.has("ssl") && !params.has("tls")) {
      params.set("ssl", "true");
    }

    const maskedAuth = dummy.username ? `${dummy.username}:***@` : "";
    const resolved = `mongodb://${auth}${hosts.join(",")}${path}?${params.toString()}`;
    const maskedResolved = `mongodb://${maskedAuth}${hosts.join(",")}${path}?${params.toString()}`;
    console.log(`[DB:DoH] Successfully constructed direct connection URI: ${maskedResolved}`);

    cachedResolvedUri = resolved;
    return resolved;
  } catch (error) {
    console.warn("[DB:DoH] Error during DoH MongoDB SRV resolution, falling back to original URI:", error);
    return uri;
  }
}

/**
 * Retrieves the MongoDB URI across all runtime contexts:
 * Node.js process.env, globalThis, Cloudflare Workers vars, and OpenNext context.
 */
async function getMongoUri(): Promise<string | undefined> {
  // 1. Direct process.env check
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // 2. globalThis process check
  const globalEnv = (globalThis as unknown as { process?: { env?: Record<string, string> } })?.process?.env;
  if (globalEnv?.MONGODB_URI) {
    return globalEnv.MONGODB_URI;
  }

  // 3. globalThis direct binding
  const globalUri = (globalThis as unknown as { MONGODB_URI?: string })?.MONGODB_URI;
  if (globalUri) {
    return globalUri;
  }

  // 4. OpenNext Cloudflare Context check
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const cfCtx = await getCloudflareContext({ async: true });
    if (cfCtx?.env && typeof cfCtx.env === "object") {
      const envRecord = cfCtx.env as Record<string, unknown>;
      if (typeof envRecord.MONGODB_URI === "string" && envRecord.MONGODB_URI) {
        console.log("[DB] Retrieved MONGODB_URI from OpenNext getCloudflareContext().env");
        return envRecord.MONGODB_URI;
      }
    }
  } catch {
    // getCloudflareContext not available
  }

  return undefined;
}

/**
 * Connects to MongoDB Atlas using a cached singleton connection.
 * Prevents exhausting database connection pool during viral traffic spikes.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  console.log(`[DB] connectToDatabase() called. Current readyState: ${cached.conn?.connection?.readyState ?? 0}`);

  const rawUri = await getMongoUri();

  if (!rawUri) {
    const availableEnvKeys = Object.keys(process.env).filter(
      (k) => !k.toLowerCase().includes("secret") && !k.toLowerCase().includes("key") && !k.toLowerCase().includes("pass"),
    );
    console.error("[DB ERROR] Missing MONGODB_URI. Visible env keys:", availableEnvKeys.join(", "));
    throw new Error(
      "Missing environment variable: Please define MONGODB_URI in wrangler.jsonc vars or Cloudflare secrets",
    );
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log("[DB] Reusing existing established MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 20000,
    };

    console.log("[DB] Initiating new MongoDB connection promise...");
    cached.promise = (async () => {
      const finalUri = await resolveMongoSrvUri(rawUri);
      console.log("[DB] Calling mongoose.connect()...");
      const m = await mongoose.connect(finalUri, opts);
      console.log(`[DB] mongoose.connect() resolved successfully! Connection readyState: ${m.connection.readyState}`);
      return m;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error("[DB ERROR] mongoose connection failed:", error);
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;

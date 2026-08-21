import mongoose from 'mongoose';

// In a serverless environment (Vercel), the module scope is reused across
// invocations on a warm instance, but each invocation could otherwise race
// to open its own connection. Caching the in-flight/connected promise here
// means concurrent requests on a warm lambda share one connection instead of
// exhausting Atlas's connection limit.
let cachedConnection = null;

/**
 * Connects to MongoDB. Reads MONGO_URI from the environment.
 * Mongoose buffers queries until the connection is live, so it is safe to
 * import models before this resolves — but we await it in server.js anyway so
 * the process fails fast on a bad URI instead of hanging on the first request.
 */
export const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');

  if (cachedConnection) return cachedConnection;

  mongoose.set('strictQuery', true);
  cachedConnection = mongoose.connect(uri).then((conn) => {
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  });

  try {
    return await cachedConnection;
  } catch (err) {
    cachedConnection = null; // let the next invocation retry instead of caching a rejection forever
    throw err;
  }
};

export const disconnectDB = () => mongoose.disconnect();

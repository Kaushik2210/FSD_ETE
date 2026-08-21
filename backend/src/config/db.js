import mongoose from 'mongoose';

/**
 * Connects to MongoDB. Reads MONGO_URI from the environment.
 * Mongoose buffers queries until the connection is live, so it is safe to
 * import models before this resolves — but we await it in server.js anyway so
 * the process fails fast on a bad URI instead of hanging on the first request.
 */
export const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');

  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export const disconnectDB = () => mongoose.disconnect();

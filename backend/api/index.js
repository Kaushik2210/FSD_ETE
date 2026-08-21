import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';

// Vercel serverless entry point. server.js (app.listen) is only used for
// local/traditional hosting -- here we instead ensure the (cached, see
// config/db.js) MongoDB connection is ready before handing the request to
// the Express app on every invocation.
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

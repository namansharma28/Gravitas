import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for serverless
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000, // Increased to 30 seconds
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use global variable in both dev and production for serverless
// This prevents creating new connections on every request
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoClient?: MongoClient;
};

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClient = client;
  globalWithMongo._mongoClientPromise = client.connect();
} else {
  client = globalWithMongo._mongoClient!;
  clientPromise = globalWithMongo._mongoClientPromise;
}

if (!clientPromise) {
  clientPromise = globalWithMongo._mongoClientPromise!;
}

// Log connection status
clientPromise
  .then(() => {
    console.log("MongoDB connected successfully");
    // Initialize collections if they don't exist (only in development)
    if (process.env.NODE_ENV === "development") {
      clientPromise.then(async (client) => {
        try {
          const db = client.db('gravitas');
          const collections = await db.listCollections().toArray();
          const collectionNames = collections.map(c => c.name);
          
          if (!collectionNames.includes('communities')) {
            await db.createCollection('communities');
            console.log('Created communities collection');
          }
        } catch (err) {
          console.error("Error initializing collections:", err);
        }
      });
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Reset the promise so it can retry on next request
    globalWithMongo._mongoClientPromise = undefined;
  });

// Helper function to get a fresh connection if needed
export async function getMongoClient(): Promise<MongoClient> {
  try {
    return await clientPromise;
  } catch (error) {
    console.error("Failed to get MongoDB client, retrying...", error);
    // Reset and retry
    globalWithMongo._mongoClientPromise = undefined;
    const newClient = new MongoClient(uri, options);
    globalWithMongo._mongoClient = newClient;
    globalWithMongo._mongoClientPromise = newClient.connect();
    return await globalWithMongo._mongoClientPromise;
  }
}

export default clientPromise;
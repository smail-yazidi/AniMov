// MongoDB setup script to create collections and indexes
// Run this script using: node scripts/setup-mongodb.js

const { MongoClient } = require("mongodb")

const MONGODB_URI =
  "mongodb+srv://smailyazidivip:mHBz0x9p3kmVqqd7@animovcluster.dg52jym.mongodb.net/?retryWrites=true&w=majority&appName=AnimovCluster"
const DB_NAME = "animov"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(DB_NAME)

    // Create collections with validation schemas

    // Users collection
    try {
      await db.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: [
              "email",
              "username",
              "displayName",
              "preferences",
              "notifications",
              "privacy",
              "createdAt",
              "updatedAt",
            ],
            properties: {
              email: { bsonType: "string" },
              username: { bsonType: "string" },
              displayName: { bsonType: "string" },
              avatar: { bsonType: "string" },
              bio: { bsonType: "string" },
              location: { bsonType: "string" },
              website: { bsonType: "string" },
              preferences: {
                bsonType: "object",
                required: ["language", "theme", "timezone", "dateFormat"],
                properties: {
                  language: { bsonType: "string" },
                  theme: { bsonType: "string" },
                  timezone: { bsonType: "string" },
                  dateFormat: { bsonType: "string" },
                },
              },
              notifications: {
                bsonType: "object",
                required: [
                  "emailNotifications",
                  "pushNotifications",
                  "friendRequests",
                  "newReleases",
                  "recommendations",
                  "weeklyDigest",
                ],
                properties: {
                  emailNotifications: { bsonType: "bool" },
                  pushNotifications: { bsonType: "bool" },
                  friendRequests: { bsonType: "bool" },
                  newReleases: { bsonType: "bool" },
                  recommendations: { bsonType: "bool" },
                  weeklyDigest: { bsonType: "bool" },
                },
              },
              privacy: {
                bsonType: "object",
                required: [
                  "profileVisibility",
                  "showWatchlist",
                  "showFavorites",
                  "allowFriendRequests",
                  "showOnlineStatus",
                ],
                properties: {
                  profileVisibility: { enum: ["public", "friends", "private"] },
                  showWatchlist: { bsonType: "bool" },
                  showFavorites: { bsonType: "bool" },
                  allowFriendRequests: { bsonType: "bool" },
                  showOnlineStatus: { bsonType: "bool" },
                },
              },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Users collection created")
    } catch (error) {
      if (error.code !== 48) {
        // Collection already exists
        console.error("Error creating users collection:", error)
      }
    }

    // Favorites collection
    try {
      await db.createCollection("favorites", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "contentId", "contentType", "title", "createdAt"],
            properties: {
              userId: { bsonType: "objectId" },
              contentId: { bsonType: "string" },
              contentType: { enum: ["movie", "tv", "anime", "manga", "book"] },
              title: { bsonType: "string" },
              poster: { bsonType: "string" },
              rating: { bsonType: "number", minimum: 0, maximum: 10 },
              year: { bsonType: "number" },
              genres: { bsonType: "array", items: { bsonType: "string" } },
              createdAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Favorites collection created")
    } catch (error) {
      if (error.code !== 48) {
        console.error("Error creating favorites collection:", error)
      }
    }

    // Friends collection
    try {
      await db.createCollection("friends", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "friendId", "status", "requestedBy", "createdAt"],
            properties: {
              userId: { bsonType: "objectId" },
              friendId: { bsonType: "objectId" },
              status: { enum: ["pending", "accepted", "blocked"] },
              requestedBy: { bsonType: "objectId" },
              createdAt: { bsonType: "date" },
              acceptedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Friends collection created")
    } catch (error) {
      if (error.code !== 48) {
        console.error("Error creating friends collection:", error)
      }
    }

    // Watchlists collection
    try {
      await db.createCollection("watchlists", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "contentId", "contentType", "title", "status", "createdAt", "updatedAt"],
            properties: {
              userId: { bsonType: "objectId" },
              contentId: { bsonType: "string" },
              contentType: { enum: ["movie", "tv", "anime"] },
              title: { bsonType: "string" },
              poster: { bsonType: "string" },
              status: { enum: ["plan-to-watch", "watching", "completed", "on-hold", "dropped"] },
              rating: { bsonType: "number", minimum: 0, maximum: 10 },
              progress: {
                bsonType: "object",
                properties: {
                  current: { bsonType: "number" },
                  total: { bsonType: "number" },
                  unit: { enum: ["episode", "season", "movie"] },
                },
              },
              notes: { bsonType: "string" },
              startDate: { bsonType: "date" },
              completedDate: { bsonType: "date" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Watchlists collection created")
    } catch (error) {
      if (error.code !== 48) {
        console.error("Error creating watchlists collection:", error)
      }
    }

    // Readlists collection
    try {
      await db.createCollection("readlists", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "contentId", "contentType", "title", "status", "createdAt", "updatedAt"],
            properties: {
              userId: { bsonType: "objectId" },
              contentId: { bsonType: "string" },
              contentType: { enum: ["manga", "book"] },
              title: { bsonType: "string" },
              poster: { bsonType: "string" },
              status: { enum: ["plan-to-read", "reading", "completed", "on-hold", "dropped"] },
              rating: { bsonType: "number", minimum: 0, maximum: 10 },
              progress: {
                bsonType: "object",
                properties: {
                  current: { bsonType: "number" },
                  total: { bsonType: "number" },
                  unit: { enum: ["chapter", "volume", "page"] },
                },
              },
              notes: { bsonType: "string" },
              startDate: { bsonType: "date" },
              completedDate: { bsonType: "date" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Readlists collection created")
    } catch (error) {
      if (error.code !== 48) {
        console.error("Error creating readlists collection:", error)
      }
    }

    // Comments collection
    try {
      await db.createCollection("comments", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "contentId", "contentType", "comment", "likes", "createdAt", "updatedAt"],
            properties: {
              userId: { bsonType: "objectId" },
              contentId: { bsonType: "string" },
              contentType: { enum: ["movie", "tv", "anime", "manga", "book"] },
              rating: { bsonType: "number", minimum: 1, maximum: 10 },
              comment: { bsonType: "string" },
              likes: { bsonType: "array", items: { bsonType: "objectId" } },
              parentId: { bsonType: "objectId" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      })
      console.log("Comments collection created")
    } catch (error) {
      if (error.code !== 48) {
        console.error("Error creating comments collection:", error)
      }
    }

    // Create indexes for optimal performance
    console.log("Creating indexes...")

    // Users indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    await db.collection("users").createIndex({ createdAt: 1 })

    // Favorites indexes
    await db.collection("favorites").createIndex({ userId: 1, contentId: 1 }, { unique: true })
    await db.collection("favorites").createIndex({ userId: 1, contentType: 1 })
    await db.collection("favorites").createIndex({ createdAt: -1 })

    // Friends indexes
    await db.collection("friends").createIndex({ userId: 1, friendId: 1 }, { unique: true })
    await db.collection("friends").createIndex({ userId: 1, status: 1 })
    await db.collection("friends").createIndex({ friendId: 1, status: 1 })
    await db.collection("friends").createIndex({ requestedBy: 1 })

    // Watchlists indexes
    await db.collection("watchlists").createIndex({ userId: 1, contentId: 1 }, { unique: true })
    await db.collection("watchlists").createIndex({ userId: 1, status: 1 })
    await db.collection("watchlists").createIndex({ updatedAt: -1 })

    // Readlists indexes
    await db.collection("readlists").createIndex({ userId: 1, contentId: 1 }, { unique: true })
    await db.collection("readlists").createIndex({ userId: 1, status: 1 })
    await db.collection("readlists").createIndex({ updatedAt: -1 })

    // Comments indexes
    await db.collection("comments").createIndex({ contentId: 1, parentId: 1 })
    await db.collection("comments").createIndex({ userId: 1 })
    await db.collection("comments").createIndex({ createdAt: -1 })
    await db.collection("comments").createIndex({ contentId: 1, contentType: 1 })

    console.log("All indexes created successfully")
    console.log("Database setup completed!")
  } catch (error) {
    console.error("Database setup error:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()

-- MongoDB doesn't use SQL, but this file documents the collections and indexes we need

-- Collections to create:
-- 1. users
-- 2. favorites
-- 3. friends
-- 4. readlists
-- 5. comments
-- 6. watchlists

-- Indexes to create for optimal performance:

-- Users collection indexes
-- db.users.createIndex({ "email": 1 }, { unique: true })
-- db.users.createIndex({ "username": 1 }, { unique: true })
-- db.users.createIndex({ "createdAt": 1 })

-- Favorites collection indexes
-- db.favorites.createIndex({ "userId": 1, "contentId": 1 }, { unique: true })
-- db.favorites.createIndex({ "userId": 1, "contentType": 1 })
-- db.favorites.createIndex({ "createdAt": -1 })

-- Friends collection indexes
-- db.friends.createIndex({ "userId": 1, "friendId": 1 }, { unique: true })
-- db.friends.createIndex({ "userId": 1, "status": 1 })
-- db.friends.createIndex({ "friendId": 1, "status": 1 })
-- db.friends.createIndex({ "requestedBy": 1 })

-- Readlists collection indexes
-- db.readlists.createIndex({ "userId": 1, "contentId": 1 }, { unique: true })
-- db.readlists.createIndex({ "userId": 1, "status": 1 })
-- db.readlists.createIndex({ "updatedAt": -1 })

-- Comments collection indexes
-- db.comments.createIndex({ "contentId": 1, "parentId": 1 })
-- db.comments.createIndex({ "userId": 1 })
-- db.comments.createIndex({ "createdAt": -1 })
-- db.comments.createIndex({ "contentId": 1, "contentType": 1 })

-- Watchlists collection indexes
-- db.watchlists.createIndex({ "userId": 1, "contentId": 1 }, { unique: true })
-- db.watchlists.createIndex({ "userId": 1, "status": 1 })
-- db.watchlists.createIndex({ "updatedAt": -1 })

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  jsonb,
  pgEnum,
  real,
  unique,
  index,
  check
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

// Validate UUID
export const uuidSchema = z.object({ uuid: z.string().uuid() });

// Enum definitions for categorical fields
const seductionStyleEnum = pgEnum("seduction_style", [
  "playful_tease",
  "mysterious_allure",
  "dominant_edge",
  "sensual_whisper"
]);
const flameLevelEnum = pgEnum("flame_level", ["mild_spark", "hot_blaze", "scorching_inferno"]);
const riskToleranceEnum = pgEnum("risk_tolerance", ["low", "medium", "high"]);
const encounterFrequencyEnum = pgEnum("encounter_frequency", ["daily", "weekly", "monthly", "sporadically"]);
const spicyMediaComfortEnum = pgEnum("spicy_media_comfort", ["very", "somewhat", "not_at_all"]);
const distancePreferenceEnum = pgEnum("distance_preference", ["local", "long_distance", "both"]);

// Subscription plan enums
const subscriptionPlanEnum = pgEnum("subscription_plan", ["basic", "premium", "platinum"]);

// New enums for dating features
const swipeActionEnum = pgEnum("swipe_action", ["like", "pass", "superlike"]);
const messageTypeEnum = pgEnum("message_type", ["text", "image", "gif", "emoji", "location"]);
const messageStatusEnum = pgEnum("message_status", ["sending", "sent", "delivered", "read"]);
const chatRequestStatusEnum = pgEnum("chat_request_status", ["pending", "accepted", "declined", "expired"]);

const swipeStatusEnum = pgEnum("swipe_status", ["active", "expired", "revoked"]);

// OTP Verification table for phone-based authentication
export const otpVerifications = pgTable("otp_verifications", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  otp: varchar("otp", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).defaultNow().notNull(),
  verifiedAt: timestamp("verified_at", { precision: 6, withTimezone: true }),
  // Track the session for security
  sessionId: varchar("session_id", { length: 255 }),
  // Track the IP for security audit
  ipAddress: varchar("ip_address", { length: 45 })
});

// Temporary tokens for new users during onboarding
export const tempTokens = pgTable("temp_tokens", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { precision: 6, withTimezone: true }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).defaultNow().notNull(),
  usedAt: timestamp("used_at", { precision: 6, withTimezone: true }),
  ipAddress: varchar("ip_address", { length: 45 })
});

// Onboarding sessions for new users
export const onboardingSessions = pgTable("onboarding_sessions", {
  uuid: uuid("uuid").defaultRandom().primaryKey(),
  onboardingId: varchar("onboarding_id", { length: 255 }).notNull().unique(),
  tempTokenId: uuid("temp_token_id")
    .notNull()
    .references(() => tempTokens.uuid, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  currentStep: varchar("current_step", { length: 50 }).notNull().default("basic_info"),
  progress: integer("progress").notNull().default(0),
  completedSteps: jsonb("completed_steps").notNull().default("[]"),
  data: jsonb("data").notNull().default("{}"), // Store all onboarding data
  isComplete: boolean("is_complete").default(false).notNull(),
  createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { precision: 6, withTimezone: true })
});

// Users table for dating app (define first to avoid circular references)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique UUID as primary key
  email: text("email").unique(), // Email for authentication
  phoneNumber: text("phoneNumber").notNull().unique(), // phone number for authentication
  name: text("name"), // Optional full name
  age: integer("age"), // Age with minimum 18 constraint (check constraint will be added in migration)
  bio: text("bio"), // Short user bio
  location: text("location"), // City or region (can be upgraded to GEOGRAPHY later)
  latitude: real("latitude"), // GPS latitude coordinate
  longitude: real("longitude"), // GPS longitude coordinate
  verified: boolean("verified").notNull().default(false), // Verification status
  interests: jsonb("interests").notNull().default("[]"), // Array of interests
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  isAdultModeEnabled: boolean("is_adult_mode_enabled").notNull().default(false), // Toggle for adult content
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }), // Last login timestamp

  // Online status fields
  isOnline: boolean("isOnline").default(false),
  lastSeen: timestamp("lastSeen", { withTimezone: true }),

  // Adult profile nested fields **KEEP THESE FIELDS EMPTY BY DEFAULT**
  seductionStyle: seductionStyleEnum("seduction_style"),
  flameLevel: flameLevelEnum("flame_level"),
  fantasyTrigger: text("fantasy_trigger"),
  powerPlayPreference: text("power_play_preference").notNull().default("maybe"), // Yes/No/Maybe
  topTurnOn: text("top_turn_on"),
  kinkScore: integer("kink_score").notNull().default(0), // 0-10 scale (check constraint will be added in migration)
  idealSetting: text("ideal_setting"),
  encounterFrequency: encounterFrequencyEnum("encounter_frequency"),
  afterPassionUnwind: text("after_passion_unwind"),
  spicyMediaComfort: spicyMediaComfortEnum("spicy_media_comfort"),
  consentImportance: integer("consent_importance").notNull().default(0), // 0-10 scale (check constraint will be added in migration)
  midnightCraving: text("midnight_craving"),
  riskTolerance: riskToleranceEnum("risk_tolerance"),
  distancePreference: distancePreferenceEnum("distance_preference"),

  // Likes data
  likesReceived: integer("likes_received").notNull().default(0),
  likesSent: integer("likes_sent").notNull().default(0),
  matches: integer("matches").notNull().default(0),
  profileViews: integer("profile_views").notNull().default(0),
  superLikes: integer("super_likes").notNull().default(3),

  // Credits data
  likesCredits: integer("likes_credits").notNull().default(50),
  notesCredits: integer("notes_credits").notNull().default(3),
  chatRequestCredits: integer("chat_request_credits").notNull().default(7),

  // Meta
  isTestUser: boolean("is_test_user").notNull().default(false),
  isDummyUser: boolean("is_dummy_user").notNull().default(false),
  
  // Preferences
  preferences: jsonb("preferences")
    .notNull()
    .default(
      '{"ageRange": {"min": 18, "max": 35}, "maxDistance": 25, "showMe": "everyone", "pushNotifications": true, "emailNotifications": false, "showOnline": true, "showDistance": true}'
    )
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // USD, EUR, etc.
  credits: integer("credits").notNull().default(0), // How many credits this adds
  metadata: jsonb("metadata").notNull().default("{}"), // Any relevant boosts etc
  isActive: boolean("is_active").notNull().default(true), // Whether the product is active or not. Can be used to disable a product without deleting it.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activePlan: subscriptionPlanEnum("active_plan").notNull(),
  recurringPrice: real("recurring_price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // USD, EUR, etc.
  renewsAt: timestamp("renews_at", { withTimezone: true }).notNull(),
  metadata: jsonb("metadata").notNull().default("{}"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Purchases table (one time boosts)
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb("metadata").notNull().default("{}") // Payment gateway details and other things
});

// Photos relation (one-to-many with users)
export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  // Add optional onboarding session reference for photos uploaded during onboarding
  onboardingSessionId: uuid("onboarding_session_id").references(() => onboardingSessions.uuid, { onDelete: "cascade" }),
  url: text("url").notNull(),
  // Add S3 metadata fields
  s3Key: text("s3_key").notNull(), // S3 object key for deletion
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(), // File size in bytes
  // Add media type field to support both photos and videos
  mediaType: varchar("media_type", { length: 20 }).notNull().default("image"), // 'image' or 'video'
  duration: integer("duration"), // Video duration in seconds (null for images)
  order: integer("order").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Swipes table to track user swipe actions
export const swipes = pgTable("swipes", {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: uuid("from_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    toUserId: uuid("to_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: swipeActionEnum("action").notNull(),
    note: text("note"),
    questionId: uuid("question_id"), // Optional, clarify purpose or add reference
    status: swipeStatusEnum("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    uniqueSwipe: unique("unique_swipe").on(table.fromUserId, table.toUserId),
    fromUserIdx: index("swipes_from_user_idx").on(table.fromUserId),
    toUserIdx: index("swipes_to_user_idx").on(table.toUserId),
    checkSelfSwipe: check("no_self_swipe", sql`${table.fromUserId} != ${table.toUserId}`)
  })
);

// Likes table (subset of swipes where action = 'like' or 'superlike')
export const likes = pgTable("likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  swipeId: uuid("swipe_id")
    .notNull()
    .references(() => swipes.id, { onDelete: "cascade" }),
  superLike: boolean("super_like").notNull().default(false),
  seen: boolean("seen").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Matches table for mutual likes
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  user1Id: uuid("user1_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user2Id: uuid("user2_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  like1Id: uuid("like1_id")
    .notNull()
    .references(() => likes.id, { onDelete: "cascade" }),
  like2Id: uuid("like2_id")
    .notNull()
    .references(() => likes.id, { onDelete: "cascade" }),
  matchedAt: timestamp("matched_at", { withTimezone: true }).notNull().defaultNow(),
  lastActivity: timestamp("last_activity", { withTimezone: true }),
  active: boolean("active").notNull().default(true), // For unmatching
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// Conversations table for chat
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  user1Id: uuid("user1_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  user2Id: uuid("user2_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Messages table for chat messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  senderId: uuid("sender_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").default("text").notNull(),
  status: messageStatusEnum("status").default("sent").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  replyToId: uuid("reply_to_id")
});

// Chat requests table for premium feature
export const chatRequests = pgTable("chat_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: uuid("from_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: chatRequestStatusEnum("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// User filters table for swipe preferences
export const userFilters = pgTable("user_filters", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  ageMin: integer("age_min").notNull().default(18),
  ageMax: integer("age_max").notNull().default(99),
  maxDistance: integer("max_distance").notNull().default(25), // in miles
  showVerifiedOnly: boolean("show_verified_only").notNull().default(false),
  showOnlineOnly: boolean("show_online_only").notNull().default(false),
  interests: jsonb("interests").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  photos: many(photos),
  subscriptions: many(subscriptions),
  purchases: many(purchases),
  sentSwipes: many(swipes, { relationName: "sentSwipes" }),
  receivedSwipes: many(swipes, { relationName: "receivedSwipes" }),
  sentLikes: many(likes, { relationName: "sentLikes" }),
  receivedLikes: many(likes, { relationName: "receivedLikes" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  sentChatRequests: many(chatRequests, { relationName: "sentChatRequests" }),
  receivedChatRequests: many(chatRequests, { relationName: "receivedChatRequests" }),
  userFilter: one(userFilters, {
    fields: [users.id],
    references: [userFilters.userId]
  })
}));

export const photosRelations = relations(photos, ({ one }) => ({
  user: one(users, {
    fields: [photos.userId],
    references: [users.id]
  }),
  onboardingSession: one(onboardingSessions, {
    fields: [photos.onboardingSessionId],
    references: [onboardingSessions.uuid]
  })
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  fromUser: one(users, {
    fields: [swipes.fromUserId],
    references: [users.id],
    relationName: "sentSwipes"
  }),
  toUser: one(users, {
    fields: [swipes.toUserId],
    references: [users.id],
    relationName: "receivedSwipes"
  })
}));

export const likesRelations = relations(likes, ({ one }) => ({
  fromUser: one(users, {
    fields: [likes.fromUserId],
    references: [users.id],
    relationName: "sentLikes"
  }),
  toUser: one(users, {
    fields: [likes.toUserId],
    references: [users.id],
    relationName: "receivedLikes"
  }),
  swipe: one(swipes, {
    fields: [likes.swipeId],
    references: [swipes.id]
  })
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1Matches"
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2Matches"
  }),
  like1: one(likes, {
    fields: [matches.like1Id],
    references: [likes.id],
    relationName: "like1Match"
  }),
  like2: one(likes, {
    fields: [matches.like2Id],
    references: [likes.id],
    relationName: "like2Match"
  }),
  conversations: many(conversations)
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  match: one(matches, {
    fields: [conversations.matchId],
    references: [matches.id]
  }),
  user1: one(users, {
    fields: [conversations.user1Id],
    references: [users.id],
    relationName: "user1Conversations"
  }),
  user2: one(users, {
    fields: [conversations.user2Id],
    references: [users.id],
    relationName: "user2Conversations"
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages"
  })
}));

export const chatRequestsRelations = relations(chatRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [chatRequests.fromUserId],
    references: [users.id],
    relationName: "sentChatRequests"
  }),
  toUser: one(users, {
    fields: [chatRequests.toUserId],
    references: [users.id],
    relationName: "receivedChatRequests"
  })
}));

export const userFiltersRelations = relations(userFilters, ({ one }) => ({
  user: one(users, {
    fields: [userFilters.userId],
    references: [users.id]
  })
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id]
  })
}));

export const productsRelations = relations(products, ({ many }) => ({
  purchases: many(purchases)
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id]
  }),
  product: one(products, {
    fields: [purchases.productId],
    references: [products.id]
  })
}));

export const onboardingSessionsRelations = relations(onboardingSessions, ({ one, many }) => ({
  tempToken: one(tempTokens, {
    fields: [onboardingSessions.tempTokenId],
    references: [tempTokens.uuid]
  }),
  photos: many(photos)
}));

// Note: Indexes will be created in the migration file

// OTP Verification schemas
export const otpVerificationInsertSchema = createInsertSchema(otpVerifications) as unknown as z.ZodType<any>;
export const otpVerificationSelectSchema = createSelectSchema(otpVerifications) as unknown as z.ZodType<any>;

export type OtpVerificationInsertType = z.infer<typeof otpVerificationInsertSchema>;
export type OtpVerificationSelectType = z.infer<typeof otpVerificationSelectSchema>;

// Temp tokens schemas
export const tempTokenInsertSchema = createInsertSchema(tempTokens) as unknown as z.ZodType<any>;
export const tempTokenSelectSchema = createSelectSchema(tempTokens) as unknown as z.ZodType<any>;

export type TempTokenInsertType = z.infer<typeof tempTokenInsertSchema>;
export type TempTokenSelectType = z.infer<typeof tempTokenSelectSchema>;

// Onboarding sessions schemas
export const onboardingSessionInsertSchema = createInsertSchema(onboardingSessions) as unknown as z.ZodType<any>;
export const onboardingSessionSelectSchema = createSelectSchema(onboardingSessions) as unknown as z.ZodType<any>;
export const onboardingSessionUpdateSchema = createUpdateSchema(onboardingSessions) as unknown as z.ZodType<any>;

export type OnboardingSessionInsertType = z.infer<typeof onboardingSessionInsertSchema>;
export type OnboardingSessionSelectType = z.infer<typeof onboardingSessionSelectSchema>;

// Users table schemas
export const userInsertSchema = createInsertSchema(users) as unknown as z.ZodType<any>;
export const userSelectSchema = createSelectSchema(users) as unknown as z.ZodType<any>;
export const userUpdateSchema = createUpdateSchema(users) as unknown as z.ZodType<any>;

export type UserInsertType = z.infer<typeof userInsertSchema>;
export type UserSelectType = z.infer<typeof userSelectSchema>;

// Photos table schemas
export const photoInsertSchema = createInsertSchema(photos) as unknown as z.ZodType<any>;
export const photoSelectSchema = createSelectSchema(photos) as unknown as z.ZodType<any>;
export const photoUpdateSchema = createUpdateSchema(photos) as unknown as z.ZodType<any>;

export type PhotoInsertType = z.infer<typeof photoInsertSchema>;
export type PhotoSelectType = z.infer<typeof photoSelectSchema>;

// Subscriptions table schemas
export const subscriptionInsertSchema = createInsertSchema(subscriptions) as unknown as z.ZodType<any>;
export const subscriptionSelectSchema = createSelectSchema(subscriptions) as unknown as z.ZodType<any>;
export const subscriptionUpdateSchema = createUpdateSchema(subscriptions) as unknown as z.ZodType<any>;

export type SubscriptionInsertType = z.infer<typeof subscriptionInsertSchema>;
export type SubscriptionSelectType = z.infer<typeof subscriptionSelectSchema>;

// Products table schemas
export const productInsertSchema = createInsertSchema(products) as unknown as z.ZodType<any>;
export const productSelectSchema = createSelectSchema(products) as unknown as z.ZodType<any>;
export const productUpdateSchema = createUpdateSchema(products) as unknown as z.ZodType<any>;

export type ProductInsertType = z.infer<typeof productInsertSchema>;
export type ProductSelectType = z.infer<typeof productSelectSchema>;

// Purchases table schemas
export const purchaseInsertSchema = createInsertSchema(purchases) as unknown as z.ZodType<any>;
export const purchaseSelectSchema = createSelectSchema(purchases) as unknown as z.ZodType<any>;
export const purchaseUpdateSchema = createUpdateSchema(purchases) as unknown as z.ZodType<any>;

export type PurchaseInsertType = z.infer<typeof purchaseInsertSchema>;
export type PurchaseSelectType = z.infer<typeof purchaseSelectSchema>;

// Swipes table schemas
export const swipeInsertSchema = createInsertSchema(swipes) as unknown as z.ZodType<any>;
export const swipeSelectSchema = createSelectSchema(swipes) as unknown as z.ZodType<any>;
export const swipeUpdateSchema = createUpdateSchema(swipes) as unknown as z.ZodType<any>;

export type SwipeInsertType = z.infer<typeof swipeInsertSchema>;
export type SwipeSelectType = z.infer<typeof swipeSelectSchema>;

// Likes table schemas
export const likeInsertSchema = createInsertSchema(likes) as unknown as z.ZodType<any>;
export const likeSelectSchema = createSelectSchema(likes) as unknown as z.ZodType<any>;
export const likeUpdateSchema = createUpdateSchema(likes) as unknown as z.ZodType<any>;

export type LikeInsertType = z.infer<typeof likeInsertSchema>;
export type LikeSelectType = z.infer<typeof likeSelectSchema>;

// Matches table schemas
export const matchInsertSchema = createInsertSchema(matches) as unknown as z.ZodType<any>;
export const matchSelectSchema = createSelectSchema(matches) as unknown as z.ZodType<any>;
export const matchUpdateSchema = createUpdateSchema(matches) as unknown as z.ZodType<any>;

export type MatchInsertType = z.infer<typeof matchInsertSchema>;
export type MatchSelectType = z.infer<typeof matchSelectSchema>;

// Conversations table schemas
export const conversationInsertSchema = createInsertSchema(conversations) as unknown as z.ZodType<any>;
export const conversationSelectSchema = createSelectSchema(conversations) as unknown as z.ZodType<any>;
export const conversationUpdateSchema = createUpdateSchema(conversations) as unknown as z.ZodType<any>;

export type ConversationInsertType = z.infer<typeof conversationInsertSchema>;
export type ConversationSelectType = z.infer<typeof conversationSelectSchema>;

// Messages table schemas
export const messageInsertSchema = createInsertSchema(messages) as unknown as z.ZodType<any>;
export const messageSelectSchema = createSelectSchema(messages) as unknown as z.ZodType<any>;
export const messageUpdateSchema = createUpdateSchema(messages) as unknown as z.ZodType<any>;

export type MessageInsertType = z.infer<typeof messageInsertSchema>;
export type MessageSelectType = z.infer<typeof messageSelectSchema>;

// Chat requests table schemas
export const chatRequestInsertSchema = createInsertSchema(chatRequests) as unknown as z.ZodType<any>;
export const chatRequestSelectSchema = createSelectSchema(chatRequests) as unknown as z.ZodType<any>;
export const chatRequestUpdateSchema = createUpdateSchema(chatRequests) as unknown as z.ZodType<any>;

export type ChatRequestInsertType = z.infer<typeof chatRequestInsertSchema>;
export type ChatRequestSelectType = z.infer<typeof chatRequestSelectSchema>;

// User filters table schemas
export const userFilterInsertSchema = createInsertSchema(userFilters) as unknown as z.ZodType<any>;
export const userFilterSelectSchema = createSelectSchema(userFilters) as unknown as z.ZodType<any>;
export const userFilterUpdateSchema = createUpdateSchema(userFilters) as unknown as z.ZodType<any>;

export type UserFilterInsertType = z.infer<typeof userFilterInsertSchema>;
export type UserFilterSelectType = z.infer<typeof userFilterSelectSchema>;
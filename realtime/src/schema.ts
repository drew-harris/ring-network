import { boolean, pgTable, text, integer } from "drizzle-orm/pg-core";

export const Node_TB = pgTable("nodes", {
  nodeId: text("nodeId").primaryKey(),
  label: text("label").notNull(),
  leftNeighbor: text("leftNeighbor").notNull(),
  rightNeighbor: text("rightNeighbor").notNull(),
  status: text("status", {
    enum: ["active", "inactive"],
  }).notNull(),
  // Replicache values
  deleted: boolean("deleted").default(false),
  version: integer("version").notNull(),
});

export const Message_TB = pgTable("messages", {
  messageId: text("messageId").primaryKey(),
  label: text("label").notNull(),
  senderId: text("senderId").notNull(),
  reciverId: text("reciverId").notNull(),
  message: text("message").notNull(),
  createdAt: text("createdAt").notNull(),
  receivedAt: text("receivedAt"),
  direction: text("direction", {
    enum: ["left", "right"],
  }).notNull(),
  path: text("path").array().notNull(),
  status: text("status", {
    enum: ["Created", "Delivered", "Undelivered"],
  }).notNull(),
  seen: boolean("seen").notNull().default(false),
  placement: text("placement", {
    enum: ["node", "system_buffer", "undelivered"],
  }).notNull(),
  // Replicache values
  deleted: boolean("deleted").default(false),
  version: integer("version").notNull(),
});

export const InFlight_TB = pgTable("in_flight", {
  messageId: text("messageId").primaryKey(),
  position: text("position").notNull(),
});

export const User_TB = pgTable("users", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull(),
  type: text("type", {
    enum: ["admin", "operator"],
  }).notNull(),
});

export const Auth_TB = pgTable("auth", {
  userId: text("user_id")
    .primaryKey()
    .references(() => User_TB.userId),
  password: text("password").notNull(),
});

export const Server_TB = pgTable("realtime_server", {
  id: text("id").primaryKey(),
  version: integer("version").notNull(),
});

export const Client_TB = pgTable("realtime_client", {
  id: text("id").primaryKey(),
  clientGroup: text("client_group_id"),
  lastMutation: integer("last_mutation").notNull(),
  version: integer("version").notNull(),
});

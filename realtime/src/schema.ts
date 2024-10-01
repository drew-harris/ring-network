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
  receivedAt: text("receivedAt").notNull(),
  direction: text("direction", {
    enum: ["left", "right"],
  }).notNull(),
  path: text("path").array().notNull(),
  status: text("status", {
    enum: ["Created", "Delivered", "Undelivered"],
  }).notNull(),
  seen: boolean("seen").notNull().default(false),
  placement: text("placement", {
    enum: ["node", "archive", "undelivered"],
  }).notNull(),
  // Replicache values
  deleted: boolean("deleted").default(false),
  version: integer("version").notNull(),
});

export const User_TB = pgTable("users", {
  userId: text("userId").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  // Replicache values
  deleted: boolean("deleted").default(false),
  version: integer("version").notNull(),
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

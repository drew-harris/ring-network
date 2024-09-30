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

import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Node Model
export const nodes = pgTable("nodes", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  graphId: text("graph_id").notNull(),
});

export const insertNodeSchema = createInsertSchema(nodes).omit({
  id: true,
});

// Edge Model
export const edges = pgTable("edges", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull(),
  targetId: text("target_id").notNull(),
  weight: integer("weight").notNull().default(1),
  graphId: text("graph_id").notNull(),
});

export const insertEdgeSchema = createInsertSchema(edges).omit({
  id: true,
});

// Graph Model
export const graphs = pgTable("graphs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled Graph"),
  elements: jsonb("elements").notNull().$type<{
    nodes: Array<{
      id: string;
      label: string;
      position: { x: number; y: number };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      weight: number;
    }>;
  }>(),
});

export const insertGraphSchema = createInsertSchema(graphs).omit({
  id: true,
});

export type InsertNode = z.infer<typeof insertNodeSchema>;
export type Node = typeof nodes.$inferSelect;

export type InsertEdge = z.infer<typeof insertEdgeSchema>;
export type Edge = typeof edges.$inferSelect;

export type InsertGraph = z.infer<typeof insertGraphSchema>;
export type Graph = typeof graphs.$inferSelect;

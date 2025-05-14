import { pgTable, text, serial, integer, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  role: true,
  avatarUrl: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  contactName: true,
  contactEmail: true,
  phone: true,
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").notNull(),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  clientId: true,
  description: true,
  isActive: true,
});

// Time entries table
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  week: integer("week").notNull(),
  date: timestamp("date").notNull(),
  hours: numeric("hours", { precision: 5, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  userId: true,
  clientId: true,
  projectId: true,
  year: true,
  month: true,
  week: true,
  date: true,
  hours: true,
  description: true,
});

// Audit log for time entries
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  timeEntryId: integer("time_entry_id").notNull(),
  userId: integer("user_id").notNull(),
  action: varchar("action", { length: 20 }).notNull(), // "create", "update", "delete"
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  timeEntryId: true,
  userId: true,
  action: true,
  previousValue: true,
  newValue: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Extended schemas with validation
export const timeEntryFormSchema = insertTimeEntrySchema.extend({
  hours: z.number().min(0.1, "Hours must be greater than 0").max(24, "Hours cannot exceed 24"),
  description: z.string().min(1, "Description is required"),
});

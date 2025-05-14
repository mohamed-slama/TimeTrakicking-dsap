import { 
  users, User, InsertUser,
  clients, Client, InsertClient,
  projects, Project, InsertProject,
  timeEntries, TimeEntry, InsertTimeEntry,
  auditLogs, AuditLog, InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between, desc } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return true; // If there's an error, an exception would be thrown
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [entry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return entry || undefined;
  }

  async getAllTimeEntries(): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByUser(userId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.userId, userId))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.projectId, projectId))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByClient(clientId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.clientId, clientId))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(between(timeEntries.date, startDate, endDate))
      .orderBy(desc(timeEntries.date));
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [entry] = await db.insert(timeEntries).values(insertTimeEntry).returning();
    return entry;
  }

  async updateTimeEntry(id: number, updateData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    // Get the old entry first for audit trail
    const oldEntry = await this.getTimeEntry(id);
    
    // Update the entry
    const [entry] = await db
      .update(timeEntries)
      .set(updateData)
      .where(eq(timeEntries.id, id))
      .returning();
    
    // Create audit log entry
    if (oldEntry && entry) {
      await this.createAuditLog({
        timeEntryId: id,
        action: "update",
        previousValue: JSON.stringify(oldEntry),
        newValue: JSON.stringify(entry),
        userId: updateData.userId || oldEntry.userId // Use the updated user ID if provided, otherwise use the old one
      });
    }
    
    return entry || undefined;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return true;
  }

  // Audit log methods
  async getAuditLogsForTimeEntry(timeEntryId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.timeEntryId, timeEntryId))
      .orderBy(desc(auditLogs.timestamp));
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(insertAuditLog).returning();
    return log;
  }

  // Reporting methods
  async getTimeEntriesByFilter(filter: {
    userId?: number;
    clientId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    year?: number;
    month?: number;
    week?: number;
  }): Promise<TimeEntry[]> {
    let conditions = [];
    
    if (filter.userId !== undefined) {
      conditions.push(eq(timeEntries.userId, filter.userId));
    }
    
    if (filter.clientId !== undefined) {
      conditions.push(eq(timeEntries.clientId, filter.clientId));
    }
    
    if (filter.projectId !== undefined) {
      conditions.push(eq(timeEntries.projectId, filter.projectId));
    }

    if (filter.year !== undefined) {
      conditions.push(eq(timeEntries.year, filter.year));
    }

    if (filter.month !== undefined) {
      conditions.push(eq(timeEntries.month, filter.month));
    }

    if (filter.week !== undefined) {
      conditions.push(eq(timeEntries.week, filter.week));
    }
    
    if (filter.startDate !== undefined && filter.endDate !== undefined) {
      conditions.push(between(timeEntries.date, filter.startDate, filter.endDate));
    }
    
    if (conditions.length === 0) {
      return await this.getAllTimeEntries();
    }
    
    return await db
      .select()
      .from(timeEntries)
      .where(and(...conditions))
      .orderBy(desc(timeEntries.date));
  }
}
import { 
  users, User, InsertUser,
  clients, Client, InsertClient,
  projects, Project, InsertProject,
  timeEntries, TimeEntry, InsertTimeEntry,
  auditLogs, AuditLog, InsertAuditLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project methods
  getProject(id: number): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Time entry methods
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  getAllTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntriesByUser(userId: number): Promise<TimeEntry[]>;
  getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]>;
  getTimeEntriesByClient(clientId: number): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // Audit log methods
  getAuditLogsForTimeEntry(timeEntryId: number): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;

  // Reporting methods
  getTimeEntriesByFilter(filter: {
    userId?: number;
    clientId?: number;
    projectId?: number;
    startDate?: Date;
    endDate?: Date;
    year?: number;
    month?: number;
    week?: number;
  }): Promise<TimeEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private timeEntries: Map<number, TimeEntry>;
  private auditLogs: Map<number, AuditLog>;
  private currentUserId: number;
  private currentClientId: number;
  private currentProjectId: number;
  private currentTimeEntryId: number;
  private currentAuditLogId: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.timeEntries = new Map();
    this.auditLogs = new Map();
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentProjectId = 1;
    this.currentTimeEntryId = 1;
    this.currentAuditLogId = 1;

    // Add some initial data
    this.seedInitialData();
  }

  // Seed some initial data for testing
  private seedInitialData(): void {
    // Add a default user
    const admin: InsertUser = {
      username: "admin",
      password: "admin123",
      fullName: "Alex Morgan",
      email: "alex@timetrack.com",
      role: "Project Manager",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    this.createUser(admin);

    const user2: InsertUser = {
      username: "taylor",
      password: "taylor123",
      fullName: "Taylor Swift",
      email: "taylor@timetrack.com",
      role: "Frontend Developer",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    this.createUser(user2);

    const user3: InsertUser = {
      username: "jamie",
      password: "jamie123",
      fullName: "Jamie Smith",
      email: "jamie@timetrack.com",
      role: "UI Designer",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    this.createUser(user3);

    const user4: InsertUser = {
      username: "casey",
      password: "casey123",
      fullName: "Casey Jones",
      email: "casey@timetrack.com",
      role: "Backend Developer",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    this.createUser(user4);

    // Add clients
    const client1: InsertClient = {
      name: "Acme Inc.",
      contactName: "John Doe",
      contactEmail: "john@acme.com",
      phone: "555-123-4567"
    };
    const acmeClient = this.createClient(client1);

    const client2: InsertClient = {
      name: "TechGrowth",
      contactName: "Jane Smith",
      contactEmail: "jane@techgrowth.com",
      phone: "555-987-6543"
    };
    const techClient = this.createClient(client2);

    const client3: InsertClient = {
      name: "Global Finance",
      contactName: "Mike Johnson",
      contactEmail: "mike@globalfinance.com",
      phone: "555-456-7890"
    };
    const financeClient = this.createClient(client3);

    const client4: InsertClient = {
      name: "Creative Studios",
      contactName: "Sarah Williams",
      contactEmail: "sarah@creativestudios.com",
      phone: "555-789-0123"
    };
    this.createClient(client4);

    // Add projects
    const project1: InsertProject = {
      name: "Website Redesign",
      clientId: acmeClient.id,
      description: "Redesigning company website to be mobile-friendly",
      isActive: 1
    };
    const websiteProject = this.createProject(project1);

    const project2: InsertProject = {
      name: "Mobile App Development",
      clientId: techClient.id,
      description: "Developing a new mobile app for client services",
      isActive: 1
    };
    const mobileProject = this.createProject(project2);

    const project3: InsertProject = {
      name: "Dashboard Redesign",
      clientId: financeClient.id,
      description: "Rebuilding finance dashboard with better analytics",
      isActive: 1
    };
    const dashboardProject = this.createProject(project3);

    // Add time entries
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const entry1: InsertTimeEntry = {
      userId: 1,
      clientId: acmeClient.id,
      projectId: websiteProject.id,
      year: 2023,
      month: 5,
      week: 20,
      date: now,
      hours: 4.5,
      description: "Working on homepage layout and responsive design adjustments"
    };
    this.createTimeEntry(entry1);

    const entry2: InsertTimeEntry = {
      userId: 2,
      clientId: techClient.id,
      projectId: mobileProject.id,
      year: 2023,
      month: 5,
      week: 20,
      date: now,
      hours: 6.0,
      description: "API integration and authentication setup"
    };
    this.createTimeEntry(entry2);

    const entry3: InsertTimeEntry = {
      userId: 3,
      clientId: financeClient.id,
      projectId: dashboardProject.id,
      year: 2023,
      month: 5,
      week: 20,
      date: now,
      hours: 3.5,
      description: "Creating chart components and responsive data tables"
    };
    this.createTimeEntry(entry3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient, 
      id, 
      createdAt: new Date() 
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;

    const updatedClient = { ...client, ...updateData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project methods
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date() 
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updateData };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Time entry methods
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async getAllTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }

  async getTimeEntriesByUser(userId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }

  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.projectId === projectId
    );
  }

  async getTimeEntriesByClient(clientId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.clientId === clientId
    );
  }

  async getTimeEntriesByDateRange(startDate: Date, endDate: Date): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.date >= startDate && entry.date <= endDate
    );
  }

  async createTimeEntry(insertTimeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.currentTimeEntryId++;
    const now = new Date();
    const timeEntry: TimeEntry = { 
      ...insertTimeEntry, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.timeEntries.set(id, timeEntry);
    
    // Create audit log for this creation
    await this.createAuditLog({
      timeEntryId: id,
      userId: insertTimeEntry.userId,
      action: "create",
      previousValue: null,
      newValue: JSON.stringify(timeEntry)
    });
    
    return timeEntry;
  }

  async updateTimeEntry(id: number, updateData: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const timeEntry = this.timeEntries.get(id);
    if (!timeEntry) return undefined;

    const previousValue = JSON.stringify(timeEntry);
    const updatedTimeEntry = { 
      ...timeEntry, 
      ...updateData, 
      updatedAt: new Date() 
    };
    this.timeEntries.set(id, updatedTimeEntry);
    
    // Create audit log for this update
    await this.createAuditLog({
      timeEntryId: id,
      userId: updateData.userId || timeEntry.userId,
      action: "update",
      previousValue,
      newValue: JSON.stringify(updatedTimeEntry)
    });
    
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    const timeEntry = this.timeEntries.get(id);
    if (!timeEntry) return false;
    
    // Create audit log for this deletion
    await this.createAuditLog({
      timeEntryId: id,
      userId: timeEntry.userId,
      action: "delete",
      previousValue: JSON.stringify(timeEntry),
      newValue: null
    });
    
    return this.timeEntries.delete(id);
  }

  // Audit log methods
  async getAuditLogsForTimeEntry(timeEntryId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values()).filter(
      (log) => log.timeEntryId === timeEntryId
    );
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.currentAuditLogId++;
    const auditLog: AuditLog = { 
      ...insertAuditLog, 
      id, 
      timestamp: new Date() 
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
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
    return Array.from(this.timeEntries.values()).filter(entry => {
      if (filter.userId !== undefined && entry.userId !== filter.userId) return false;
      if (filter.clientId !== undefined && entry.clientId !== filter.clientId) return false;
      if (filter.projectId !== undefined && entry.projectId !== filter.projectId) return false;
      if (filter.year !== undefined && entry.year !== filter.year) return false;
      if (filter.month !== undefined && entry.month !== filter.month) return false;
      if (filter.week !== undefined && entry.week !== filter.week) return false;
      if (filter.startDate !== undefined && entry.date < filter.startDate) return false;
      if (filter.endDate !== undefined && entry.date > filter.endDate) return false;
      return true;
    });
  }
}

export const storage = new MemStorage();

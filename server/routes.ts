import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTimeEntrySchema, insertClientSchema, insertProjectSchema, timeEntryFormSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - all prefixed with /api
  
  // Users endpoints
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Clients endpoints
  app.get("/api/clients", async (_req: Request, res: Response) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(clientData);
      res.status(201).json(newClient);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(id, clientData);
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      if (clientId) {
        const projects = await storage.getProjectsByClient(clientId);
        return res.json(projects);
      }
      
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const newProject = await storage.createProject(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Time entries endpoints
  app.get("/api/time-entries", async (req: Request, res: Response) => {
    try {
      const filter: any = {};
      
      // Parse filter parameters
      if (req.query.userId) filter.userId = parseInt(req.query.userId as string);
      if (req.query.clientId) filter.clientId = parseInt(req.query.clientId as string);
      if (req.query.projectId) filter.projectId = parseInt(req.query.projectId as string);
      if (req.query.year) filter.year = parseInt(req.query.year as string);
      if (req.query.month) filter.month = parseInt(req.query.month as string);
      if (req.query.week) filter.week = parseInt(req.query.week as string);
      
      if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
      
      const timeEntries = await storage.getTimeEntriesByFilter(filter);
      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get("/api/time-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntry = await storage.getTimeEntry(id);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(timeEntry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entry" });
    }
  });

  app.post("/api/time-entries", async (req: Request, res: Response) => {
    try {
      const timeEntryData = timeEntryFormSchema.parse(req.body);
      const newTimeEntry = await storage.createTimeEntry(timeEntryData);
      res.status(201).json(newTimeEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntryData = timeEntryFormSchema.partial().parse(req.body);
      const updatedTimeEntry = await storage.updateTimeEntry(id, timeEntryData);
      if (!updatedTimeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(updatedTimeEntry);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTimeEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Audit logs endpoint
  app.get("/api/audit-logs/:timeEntryId", async (req: Request, res: Response) => {
    try {
      const timeEntryId = parseInt(req.params.timeEntryId);
      const auditLogs = await storage.getAuditLogsForTimeEntry(timeEntryId);
      res.json(auditLogs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Reports endpoints
  app.get("/api/reports/summary", async (req: Request, res: Response) => {
    try {
      const filter: any = {};
      
      // Parse filter parameters
      if (req.query.userId) filter.userId = parseInt(req.query.userId as string);
      if (req.query.clientId) filter.clientId = parseInt(req.query.clientId as string);
      if (req.query.projectId) filter.projectId = parseInt(req.query.projectId as string);
      if (req.query.startDate) filter.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.endDate = new Date(req.query.endDate as string);
      
      const timeEntries = await storage.getTimeEntriesByFilter(filter);
      
      // Calculate summary data
      let totalHours = 0;
      const byUser: Record<number, number> = {};
      const byClient: Record<number, number> = {};
      const byProject: Record<number, number> = {};
      
      timeEntries.forEach(entry => {
        const hours = parseFloat(entry.hours.toString());
        totalHours += hours;
        
        byUser[entry.userId] = (byUser[entry.userId] || 0) + hours;
        byClient[entry.clientId] = (byClient[entry.clientId] || 0) + hours;
        byProject[entry.projectId] = (byProject[entry.projectId] || 0) + hours;
      });
      
      res.json({
        totalHours,
        byUser,
        byClient,
        byProject,
        entryCount: timeEntries.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import 'dotenv/config';
import { db } from "./db";
import { users, clients, projects, timeEntries, auditLogs } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

async function seedDemo() {
  try {
    // Delete all data
    await db.delete(auditLogs);
    await db.delete(timeEntries);
    await db.delete(projects);
    await db.delete(clients);
    await db.delete(users);

    // Create users
    const userData = [
      { username: "admin", password: await hashPassword("dsap@2025"), fullName: "Admin User", email: "admin@timetrack.com", role: "Admin" },
      { username: "jane", password: await hashPassword("password123"), fullName: "Jane Doe", email: "jane@timetrack.com", role: "Frontend Developer" },
      { username: "john", password: await hashPassword("password123"), fullName: "John Smith", email: "john@timetrack.com", role: "Backend Developer" },
    ];
    const insertedUsers = await db.insert(users).values(userData).returning();

    // Create clients
    const clientData = [
      { name: "Acme Corp", contactName: "Alice Acme", contactEmail: "alice@acme.com", phone: "555-111-2222" },
      { name: "Globex Inc", contactName: "Bob Globex", contactEmail: "bob@globex.com", phone: "555-333-4444" },
    ];
    const insertedClients = await db.insert(clients).values(clientData).returning();

    // Create projects
    const projectData = [
      { name: "Website Redesign", clientId: insertedClients[0].id, isActive: 1 },
      { name: "Mobile App", clientId: insertedClients[1].id, isActive: 1 },
    ];
    const insertedProjects = await db.insert(projects).values(projectData).returning();

    // Create time entries for the last 3 months
    const now = new Date();
    const timeEntryData = [];
    for (let m = 0; m < 3; m++) {
      for (let d = 1; d <= 28; d += 2) {
        for (const user of insertedUsers) {
          const date = new Date(now.getFullYear(), now.getMonth() - m, d);
          const project = insertedProjects[Math.floor(Math.random() * insertedProjects.length)];
          const client = insertedClients.find(c => c.id === project.clientId);
          if (!client) continue;
          timeEntryData.push({
            userId: user.id,
            clientId: client.id,
            projectId: project.id,
            date,
            hours: (Math.random() * 4 + 2).toFixed(1),
            description: `Worked on ${project.name} for ${client.name}`,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            week: Math.ceil(date.getDate() / 7),
          });
        }
      }
    }
    await db.insert(timeEntries).values(timeEntryData);

    console.log("Demo data seeded:");
    console.log(`Users: ${insertedUsers.length}`);
    console.log(`Clients: ${insertedClients.length}`);
    console.log(`Projects: ${insertedProjects.length}`);
    console.log(`Time Entries: ${timeEntryData.length}`);
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

seedDemo(); 
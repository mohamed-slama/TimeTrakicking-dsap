import { db } from "./db";
import {
  users, InsertUser,
  clients, InsertClient,
  projects, InsertProject,
  timeEntries, InsertTimeEntry
} from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // First check if we already have users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping seed");
    return;
  }

  // Seed users
  console.log("Seeding users...");
  const admin: InsertUser = {
    username: "admin",
    password: "admin123", // Note: In a real app, this would be hashed
    fullName: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    avatarUrl: "https://ui-avatars.com/api/?name=Admin+User&background=random"
  };

  const user2: InsertUser = {
    username: "jsmith",
    password: "pass123",
    fullName: "John Smith",
    email: "john.smith@example.com",
    role: "Developer",
    avatarUrl: "https://ui-avatars.com/api/?name=John+Smith&background=random"
  };

  const user3: InsertUser = {
    username: "ajones",
    password: "pass123",
    fullName: "Alice Jones",
    email: "alice.jones@example.com",
    role: "Designer",
    avatarUrl: "https://ui-avatars.com/api/?name=Alice+Jones&background=random"
  };

  const user4: InsertUser = {
    username: "mwilson",
    password: "pass123",
    fullName: "Mike Wilson",
    email: "mike.wilson@example.com",
    role: "Project Manager",
    avatarUrl: "https://ui-avatars.com/api/?name=Mike+Wilson&background=random"
  };

  const [adminUser] = await db.insert(users).values(admin).returning();
  const [johnUser] = await db.insert(users).values(user2).returning();
  const [aliceUser] = await db.insert(users).values(user3).returning();
  const [mikeUser] = await db.insert(users).values(user4).returning();

  // Seed clients
  console.log("Seeding clients...");
  const client1: InsertClient = {
    name: "Acme Inc.",
    contactName: "John Doe",
    contactEmail: "john.doe@acme.com",
    phone: "+1-555-123-4567"
  };

  const client2: InsertClient = {
    name: "Globex Corp",
    contactName: "Jane Smith",
    contactEmail: "jane.smith@globex.com",
    phone: "+1-555-987-6543"
  };

  const client3: InsertClient = {
    name: "Initech",
    contactName: "Bill Lumbergh",
    contactEmail: "bill@initech.com",
    phone: "+1-555-456-7890"
  };

  const client4: InsertClient = {
    name: "Umbrella Corp",
    contactName: "Albert Wesker",
    contactEmail: "wesker@umbrella.com",
    phone: "+1-555-789-0123"
  };

  const [acme] = await db.insert(clients).values(client1).returning();
  const [globex] = await db.insert(clients).values(client2).returning();
  const [initech] = await db.insert(clients).values(client3).returning();
  const [umbrella] = await db.insert(clients).values(client4).returning();

  // Seed projects
  console.log("Seeding projects...");
  const project1: InsertProject = {
    name: "Website Redesign",
    clientId: acme.id,
    description: "Redesign of the company website",
    isActive: 1
  };

  const project2: InsertProject = {
    name: "Mobile App Development",
    clientId: globex.id,
    description: "Development of iOS and Android applications",
    isActive: 1
  };

  const project3: InsertProject = {
    name: "ERP Implementation",
    clientId: initech.id,
    description: "Implementation of ERP system",
    isActive: 0
  };

  const [website] = await db.insert(projects).values(project1).returning();
  const [mobileApp] = await db.insert(projects).values(project2).returning();
  const [erp] = await db.insert(projects).values(project3).returning();

  // Seed time entries
  console.log("Seeding time entries...");
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentWeek = Math.ceil(today.getDate() / 7);

  const entry1: InsertTimeEntry = {
    userId: adminUser.id,
    clientId: acme.id,
    projectId: website.id,
    year: currentYear,
    month: currentMonth,
    week: currentWeek - 1,
    date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    hours: "4.5",
    description: "Home page redesign"
  };

  const entry2: InsertTimeEntry = {
    userId: johnUser.id,
    clientId: globex.id,
    projectId: mobileApp.id,
    year: currentYear,
    month: currentMonth,
    week: currentWeek - 1,
    date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    hours: "6",
    description: "API integration"
  };

  const entry3: InsertTimeEntry = {
    userId: aliceUser.id,
    clientId: acme.id,
    projectId: website.id,
    year: currentYear,
    month: currentMonth,
    week: currentWeek,
    date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    hours: "3.5",
    description: "UI improvements"
  };

  await db.insert(timeEntries).values(entry1);
  await db.insert(timeEntries).values(entry2);
  await db.insert(timeEntries).values(entry3);

  console.log("Database seeded successfully!");
}

// Execute the seed function
seedDatabase()
  .then(() => {
    console.log("Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
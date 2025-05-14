import 'dotenv/config';
import { db } from "./db";
import { users } from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  try {
    // Delete all users first
    await db.delete(users);

    // Now create the admin user
    const hashedPassword = await hashPassword("dsap@2025");
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      fullName: "Admin User",
      email: "admin@timetrack.com",
      role: "Admin",
    });
    console.log("Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: dsap@2025");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
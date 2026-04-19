import { z } from 'zod';

// Map Entry Schema
export const mapEntrySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lon: z.coerce.number().min(-180).max(180).optional().nullable(),
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().default("strait"),
  tags: z.string().optional().nullable(),
  year: z.coerce.number().int().optional().nullable(),
  prelims: z.string().optional().default(""),
  mains: z.string().optional().default(""),
  india: z.string().optional().default(""),
  // Hierarchy
  worldPart: z.string().optional().default("POLITICAL"),
  continent: z.string().optional().nullable(),
  admRegion: z.string().optional().nullable(),
  geoGroup: z.string().optional().nullable(),
  capital: z.string().optional().nullable(),
});

// Bulk Map Entries Schema
export const bulkEntriesSchema = z.object({
  entries: z.array(mapEntrySchema),
});

// Admin User Schema
export const adminUserSchema = z.object({
  email: z.string().email("Invalid email").optional().nullable(),
  username: z.string().min(3, "Username must be at least 3 characters").optional().nullable(),
  name: z.string().min(1, "Name is required").max(100),
  tier: z.enum(["FREE", "PRO"]).default("FREE"),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().nullable(),
});

// Communication Schema
export const commsSchema = z.object({
  channel: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
  type: z.string().optional().default("MARKETING"),
  content: z.string().min(1, "Content is required"),
  recipients: z.union([
    z.enum(["ALL", "PRO", "FREE"]),
    z.array(z.string())
  ]),
  templateName: z.string().optional(),
  params: z.record(z.any()).optional(),
});

// Usage Schema
export const usageIncrementSchema = z.object({
  incrementSeconds: z.number().int().min(0).max(60),
});

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  examYear: z.coerce.number().int().min(2024).max(2030).optional().nullable(),
  preferences: z.record(z.any()).optional().nullable(),
});

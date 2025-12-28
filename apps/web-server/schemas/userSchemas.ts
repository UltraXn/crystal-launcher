import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        username: z.string().min(3, { message: "Username must be at least 3 characters long" }).max(20),
        minecraft_nick: z.string().optional(),
    }),
});

export const updateUserSchema = z.object({
    body: z.object({
        full_name: z.string().optional(),
        username: z.string().min(3).max(20).optional(),
        minecraft_nick: z.string().optional(),
        bio: z.string().max(500).optional(),
        social_discord: z.string().optional(), // Could add regex validation for discord handle
        social_twitter: z.string().optional(),
        social_twitch: z.string().optional(),
        social_youtube: z.string().optional(),
    }),
});

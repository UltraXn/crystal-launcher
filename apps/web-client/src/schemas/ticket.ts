import { z } from 'zod';

export const createTicketSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title too long"),
    description: z.string().min(20, "Please provide more detail (min 20 chars)").max(2000),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    category: z.enum(['general', 'bug', 'report', 'billing', 'other']).optional()
});

export const addTicketMessageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty").max(1000),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
export type AddTicketMessageFormValues = z.infer<typeof addTicketMessageSchema>;

import { z } from 'zod';

export const createSuggestionSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(100),
        description: z.string().min(10).max(1000),
        type: z.enum(['server', 'web', 'discord', 'other']).optional()
    }),
});

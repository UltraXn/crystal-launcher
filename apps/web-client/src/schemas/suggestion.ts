import { z } from 'zod';

export const createSuggestionSchema = z.object({
    nickname: z.string().min(3, "Nickname required (min 3 chars)").max(50),
    type: z.enum(['General', 'Bug', 'Mod', 'Complaint', 'Poll', 'other', 'server', 'web', 'discord']), // Combined enums to be safe
    message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long")
});


export type CreateSuggestionFormValues = z.infer<typeof createSuggestionSchema>;

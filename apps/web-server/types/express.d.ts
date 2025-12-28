export {};

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username?: string;
                role: string;
                email?: string;
                minecraft_uuid?: string;
            };
        }
    }
}

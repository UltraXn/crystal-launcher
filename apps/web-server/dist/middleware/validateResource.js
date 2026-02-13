import { ZodError } from 'zod';
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (error) {
        if (error instanceof ZodError) {
            // ZodError by default has an 'errors' property
            return res.status(400).json({
                error: 'Validation Error',
                details: error.issues.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        return res.status(500).json({ error: 'Internal Server Error during validation' });
    }
};

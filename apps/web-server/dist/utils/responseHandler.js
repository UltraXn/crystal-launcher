export const sendSuccess = (res, data, message, meta) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta
    });
};
export const sendError = (res, message, code = 'INTERNAL_ERROR', statusCode = 500, details) => {
    // Sanitize details to avoid circular references (common in Error objects)
    let safeDetails = details;
    if (details instanceof Error) {
        safeDetails = {
            message: details.message,
            stack: process.env.NODE_ENV === 'development' ? details.stack : undefined
        };
    }
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
            details: safeDetails
        }
    });
};

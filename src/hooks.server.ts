import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
    const errorId = crypto.randomUUID();

    // In a real app, you might send this to Sentry or another logging service
    console.error(`[Server Error] ID: ${errorId}`, {
        message: (error as Error)?.message ?? 'Unknown error',
        url: event.url.toString(),
        params: event.params,
        stack: (error as Error)?.stack
    });

    return {
        message: 'Whoops! Something went wrong on our side.',
        errorId
    };
};

import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error, event }) => {
    const errorId = crypto.randomUUID();

    // In a real app, you might send this to Sentry or another logging service
    console.error(`[Client Error] ID: ${errorId}`, {
        message: (error as Error)?.message ?? 'Unknown error',
        url: event.url.toString(),
        params: event.params,
        stack: (error as Error)?.stack
    });

    return {
        message: 'An unexpected error occurred in your browser.',
        errorId
    };
};

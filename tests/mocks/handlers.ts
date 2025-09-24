import { http, HttpResponse } from 'msw';

// Mock handlers for API endpoints
export const testHandlers = [
  // Supabase API mocks
  http.get('https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/*', () => {
    return HttpResponse.json([]);
  }),

  http.post('https://gyburnfaszhxcxdnwogj.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({ id: '123', created_at: new Date().toISOString() });
  }),

  // Auth mocks
  http.post('https://gyburnfaszhxcxdnwogj.supabase.co/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      user: { id: '123', email: 'test@example.com' },
    });
  }),

  // Default handler for unmatched requests
  http.get('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
];

// Helper function to create mock responses
export const createMockResponse = (data: any, status = 200) => {
  return HttpResponse.json(data, { status });
};

export const createMockError = (message: string, status = 500) => {
  return HttpResponse.json({ error: message }, { status });
};

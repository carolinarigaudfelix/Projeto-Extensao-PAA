import * as nextauth from './[...nextauth]/route';

// Re-export handlers to satisfy type-checkers or tools expecting this path.
export const GET = nextauth.GET;
export const POST = nextauth.POST;

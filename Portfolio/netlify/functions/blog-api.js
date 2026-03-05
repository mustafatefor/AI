import { neon } from '@netlify/neon';

export const handler = async (event, context) => {
    // Automatically uses env NETLIFY_DATABASE_URL
    const sql = neon();

    try {
        const { id } = event.queryStringParameters || {};

        // 1. Fetch single post if ID is provided
        if (id) {
            const result = await sql`SELECT * FROM posts WHERE id = ${id}`;

            if (result.length === 0) {
                return { statusCode: 404, body: "Post not found" };
            }

            return {
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(result[0]),
            };
        }

        // 2. Otherwise, fetch all posts (summary only)
        const result = await sql`SELECT id, title, date, excerpt FROM posts ORDER BY date DESC`;

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result),
        };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
        };
    }
};

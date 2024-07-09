import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function GET({ url }) {
    const query = url.searchParams.get('query');
    if (!query) {
        return json([]);
    }

    const results = await prisma.$queryRaw`
        SELECT nickname 
        FROM game_data 
        WHERE nickname LIKE ${'%' + query + '%'}
        GROUP BY nickname
        ORDER BY COUNT(nickname) DESC
        LIMIT 10
    `;

    const suggestions = results.map(result => result.nickname);
    return json(suggestions);
}

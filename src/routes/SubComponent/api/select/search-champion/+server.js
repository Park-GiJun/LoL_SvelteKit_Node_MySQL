import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function GET({ url }) {
    const query = url.searchParams.get('query');
    if (!query) {
        return json([]);
    }

    const results = await prisma.$queryRaw`
        SELECT champion
        FROM champion 
        WHERE champion LIKE ${'%' + query + '%'}
        GROUP BY champion
        LIMIT 10
    `;

    const suggestions = results.map(result => result.champion);
    return json(suggestions);
}

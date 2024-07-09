import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function GET({ url }) {
    const query = url.searchParams.get('query');
    if (!query) {
        return json({ exists: false });
    }

    const results = await prisma.$queryRaw`
        SELECT match_code
        FROM match_code
        WHERE match_code = ${query}
    `;

    console.log(results);

    return json({ exists: results.length > 0 });
}

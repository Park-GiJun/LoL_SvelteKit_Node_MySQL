import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function GET({ url }) {
    const date = url.searchParams.get('date');
    const formattedDate = date.substring(0, 10);

    const results = await prisma.$queryRaw`
        SELECT *
        FROM game_data
        WHERE date LIKE ${'%' + formattedDate + '%'}
        ORDER BY date
    `;

    const serializedResults = JSON.parse(JSON.stringify(results, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    return json(serializedResults);
}

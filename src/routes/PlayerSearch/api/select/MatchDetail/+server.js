import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

export async function GET({ url }) {
    const matchCode = url.searchParams.get('matchCode');
    try {
        const data = await prisma.$queryRaw`
            SELECT *
            FROM game_data
            WHERE match_code=${matchCode};
        `;

        const transformedData = JSON.parse(JSON.stringify(data, replacer));

        return json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

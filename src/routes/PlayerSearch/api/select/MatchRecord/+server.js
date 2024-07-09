import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

export async function GET({ url }) {
    const nickName = url.searchParams.get('nickname');
    try {
        const data = await prisma.$queryRaw`
            SELECT champion,
                   kills,
                   deaths,
                   assists,
                   IF(winning = 1, 'Win', 'Loss') AS result,
                   position,
                   date,
                   match_code
            FROM game_data
            WHERE nickname = ${nickName}
            ORDER BY date desc;
        `;

        const transformedData = JSON.parse(JSON.stringify(data, replacer));

        return json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

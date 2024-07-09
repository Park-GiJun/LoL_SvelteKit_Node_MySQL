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
            WITH PositionStats AS (
                SELECT position,
                       SUM(IF(winning = 1, 1, 0)) * 100.0 / COUNT(*) AS winRate,
                       COUNT(*)                                      AS played
                FROM game_data
                WHERE nickname = ${nickName}
                GROUP BY position
            )
            SELECT position,
                   CONCAT(ROUND(winRate, 2), '%') AS winRate,
                   played
            FROM PositionStats
            ORDER BY winRate DESC;
        `;

        const transformedData = JSON.parse(JSON.stringify(data, replacer));

        return json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

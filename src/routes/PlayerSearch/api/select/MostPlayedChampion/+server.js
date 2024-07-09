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
            WITH ChampionStats AS (
                SELECT champion,
                       position,
                       SUM(IF(winning = 1, 1, 0)) * 100.0 / COUNT(*) AS winRate,
                       AVG((kills + assists) * 1.0 / deaths)         AS kda,
                       COUNT(*)                                      AS totalGames
                FROM game_data
                WHERE nickname = ${nickName}
                GROUP BY champion, position
            )
            SELECT champion,
                   position,
                   CONCAT(ROUND(winRate, 2), '%') AS winRate,
                   ROUND(kda, 1)                  AS kda
            FROM ChampionStats
            ORDER BY winRate DESC
            LIMIT 5;


        `;

        // Transform BigInt values to string using JSON.stringify with replacer
        const transformedData = JSON.parse(JSON.stringify(data, replacer));

        return json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

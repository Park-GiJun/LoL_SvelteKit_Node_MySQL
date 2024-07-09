import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

function replacer(key, value) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

export async function GET() {
    try {
        const data = await prisma.$queryRaw`
            SELECT
                g.nickname AS nickname,
                (SELECT gd.champion
                 FROM game_data gd
                 WHERE gd.nickname = g.nickname
                 GROUP BY gd.champion
                 ORDER BY COUNT(*) DESC, gd.champion ASC
                 LIMIT 1) AS mostChampion,
                (SELECT COUNT(*)
                 FROM game_data gd
                 WHERE gd.nickname = g.nickname) AS playedGames,
                ROUND(SUM(CASE WHEN g.winning = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS winningPercentage,
                ROUND((SUM(g.kills) + SUM(g.assists)) / GREATEST(SUM(g.deaths), 1), 2) AS kda,
                (SELECT gd2.position
                 FROM game_data gd2
                 WHERE gd2.nickname = g.nickname
                 GROUP BY gd2.position
                 ORDER BY COUNT(*) DESC
                 LIMIT 1) AS mostPosition
            FROM game_data g
            GROUP BY g.nickname
            ORDER BY winningPercentage DESC, playedGames DESC, kda DESC
        `;

        const jsonData = JSON.stringify(data, replacer);

        return json(JSON.parse(jsonData));
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

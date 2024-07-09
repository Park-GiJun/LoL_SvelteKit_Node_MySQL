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
            SELECT COUNT(g.id) / 10       AS totalGamesPlayed,
                   COUNT(DISTINCT g.date) AS totalDaysPlayed,
                   SUM(g.kills)           AS totalKills,
                   (SELECT gg.champion
                    FROM game_data gg
                    GROUP BY gg.champion
                    HAVING COUNT(gg.champion) >= 1
                    ORDER BY COUNT(gg.champion) DESC, SUM(gg.kills) DESC
                    LIMIT 1)              AS mostPlayedChampion,
                   (SELECT gg.champion
                    FROM game_data gg
                    GROUP BY gg.champion
                    HAVING COUNT(gg.champion) >= 1
                    ORDER BY (SUM(gg.kills) / COUNT(gg.champion)) DESC
                    LIMIT 1)              AS mostKillsChampion,
                   (SELECT gg.champion
                    FROM game_data gg
                    GROUP BY gg.champion
                    HAVING COUNT(gg.champion) >= 1
                    ORDER BY (SUM(gg.deaths) / COUNT(gg.champion)) DESC
                    LIMIT 1)              AS mostDeathsChampion,
                   (SELECT gg.nickname
                    FROM game_data gg
                    GROUP BY gg.summoner_name
                    ORDER BY COUNT(DISTINCT gg.champion) DESC
                    LIMIT 1)              AS mostDifferentChampion,
                   (SELECT gg.champion
                    FROM game_data gg
                    GROUP BY gg.champion
                    HAVING COUNT(gg.champion) >= 1
                    ORDER BY ((SUM(gg.kills) + SUM(gg.assists)) / NULLIF(SUM(gg.deaths), 0)) DESC
                    LIMIT 1)              AS bestKDAChampion
            FROM game_data g
        `;

        const jsonData = JSON.stringify(data, replacer);

        return json(JSON.parse(jsonData));
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

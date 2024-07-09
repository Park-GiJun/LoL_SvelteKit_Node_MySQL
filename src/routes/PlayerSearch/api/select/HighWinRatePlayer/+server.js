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
            WITH MatchCodes AS (
                SELECT DISTINCT match_code, team_color
                FROM game_data
                WHERE nickname = ${nickName}
            ),
                 TeammateWinRates AS (
                     SELECT
                         gm.nickname,
                         SUM(gm.winning) AS wins,
                         COUNT(DISTINCT gm.match_code) AS total_matches,  -- 같은 팀일 경우에만 카운트
                         (SUM(gm.winning) * 1.0 / COUNT(DISTINCT gm.match_code)) AS win_rate
                     FROM
                         game_data gm
                             JOIN
                         MatchCodes mc ON gm.match_code = mc.match_code AND gm.team_color = mc.team_color
                     WHERE
                         gm.nickname != ${nickName}
                     GROUP BY
                         gm.nickname
                 )
            SELECT
                nickname AS player,
                ROUND(win_rate * 100, 2) AS winRate,
                total_matches AS played
            FROM
                TeammateWinRates
            ORDER BY
                winRate DESC,
                total_matches desc
                LIMIT 5;
        `;

        const transformedData = JSON.parse(JSON.stringify(data, replacer));

        return json(transformedData);
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

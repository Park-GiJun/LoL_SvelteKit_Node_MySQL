import { json } from '@sveltejs/kit';
import prisma from '$lib/prisma.js';
import {addHours} from "date-fns";

export async function POST({ request }) {
    const { matchCode, blueTeam, redTeam, winning } = await request.json();
    let winning_fg;

    const now = new Date();

    const koreaNow = addHours(now, 9);

    try {
        const gameData = [];

        prisma.$queryRaw`
            INSERT INTO match_code (match_code, winning)
            values (${matchCode}, '0')
        `;

        for (const player of blueTeam) {
            if(winning ==='blue'){
                winning_fg = '1';
            } else {
                winning_fg = '0';
            }
            gameData.push({
                assists: parseInt(player.assists, 10),
                champion: player.champion,
                date: koreaNow,
                deaths: parseInt(player.deaths, 10),
                kills: parseInt(player.kills, 10),
                match_code: matchCode,
                nickname: player.nickname,
                position: player.position,
                team_color: 'blue',
                winning: parseInt(winning_fg,10)
            });
        }

        for (const player of redTeam) {
            if(winning ==='red'){
                winning_fg = '1';
            } else {
                winning_fg = '0';
            }
            gameData.push({
                assists: parseInt(player.assists, 10),
                champion: player.champion,
                date: new Date(),
                deaths: parseInt(player.deaths, 10),
                kills: parseInt(player.kills, 10),
                match_code: matchCode,
                nickname: player.nickname,
                position: player.position,
                team_color: 'red',
                winning: parseInt(winning_fg,10)
            });
        }

        const savedGameData = await prisma.game_data.createMany({
            data: gameData
        });

        console.log('Saved game data:', savedGameData);

        return json({ success: true, match: savedGameData });
    } catch (error) {
        console.error('Error saving game data:', error);
        return json({ success: false, error: error.message });
    }
}

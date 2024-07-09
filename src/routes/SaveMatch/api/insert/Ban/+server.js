import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST({ request }) {
    const { matchCode, bans } = await request.json();

    console.log(bans);

    const banPromises = bans.map(ban => {
        return prisma.ban.create({
            data: {
                ban_champion: ban.banChampion,
                ban_team_color: ban.banTeamColor,
                match_code: matchCode
            }
        });
    });

    try {
        await Promise.all(banPromises);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.error('Error saving bans:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
}

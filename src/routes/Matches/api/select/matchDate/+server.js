import {json} from '@sveltejs/kit';
import prisma from '$lib/prisma.js';

export async function GET() {
    const results = await prisma.$queryRaw`
        SELECT date
        from game_data
        group by date
        order by date desc;
    `;
    return json(results);
}

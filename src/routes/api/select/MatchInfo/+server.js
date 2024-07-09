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
            SELECT *
            FROM game_data
            ORDER BY id desc
            LIMIT 10
        `;

        const jsonData = JSON.stringify(data, replacer);

        return json(JSON.parse(jsonData));
    } catch (error) {
        console.error('Error fetching data:', error);
        return json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

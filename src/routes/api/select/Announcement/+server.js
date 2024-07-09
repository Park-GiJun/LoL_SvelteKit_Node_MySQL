import { PrismaClient } from '@prisma/client';
import { formatISO, addHours } from 'date-fns';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const now = new Date();
        const koreaNow = addHours(now, 9);
        const formattedKoreaNow = formatISO(koreaNow);

        console.log("KST Date:", formattedKoreaNow);

        const announcements = await prisma.$queryRaw`
            SELECT * FROM announcements
            WHERE expiredDate >= ${formattedKoreaNow}
            ORDER BY createDate DESC
            LIMIT 1
        `;

        return new Response(JSON.stringify(announcements), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return new Response(JSON.stringify({ error: "Error fetching announcements" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

<script>
    export let match = [];

    const positionOrder = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

    let winners = [];
    let losers = [];
    let blueTeam = [];
    let redTeam = [];

    $: {
        if (Array.isArray(match)) {
            winners = match.filter(player => player.winning === 1);
            losers = match.filter(player => player.winning === 0);

            blueTeam = winners.filter(player => player.team_color.toLowerCase() === 'blue');
            redTeam = losers.filter(player => player.team_color.toLowerCase() === 'red');

            if (blueTeam.length === 0) {
                blueTeam = losers.filter(player => player.team_color.toLowerCase() === 'blue');
                redTeam = winners.filter(player => player.team_color.toLowerCase() === 'red');
            }

            blueTeam.sort(sortByPosition);
            redTeam.sort(sortByPosition);
        }
    }

    function sortByPosition(a, b) {
        return positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position);
    }
</script>

<div class="p-4 text-xs text-center dark:bg-gray-900 overflow-y-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class={`p-4 rounded-lg shadow-md ${blueTeam[0]?.winning ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>
            <h2 class="text-center font-bold mb-2">블루팀</h2>
            {#each blueTeam as player (player.nickname)}
                <div class={`text-xxs grid grid-cols-3 p-2 border-t ${blueTeam[0]?.winning ? 'border-blue-200 dark:border-blue-800' : 'border-pink-200 dark:border-pink-800'}`}>
                    <div class="text-xxs text-center">{player.nickname}</div>
                    <div class="text-xxs text-center">{player.champion}</div>
                    <div class="text-xxs text-center">{player.kills}/{player.deaths}/{player.assists}</div>
                </div>
            {/each}
        </div>
        <div class={`text-xxs p-4 rounded-lg shadow-md ${redTeam[0]?.winning ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>
            <h2 class="text-center font-bold mb-2">레드팀</h2>
            {#each redTeam as player (player.nickname)}
                <div class={`grid grid-cols-3 p-2 border-t ${redTeam[0]?.winning ? 'border-blue-200 dark:border-blue-800' : 'border-pink-200 dark:border-pink-800'}`}>
                    <div class="text-xxs text-center">{player.nickname}</div>
                    <div class="text-xxs text-center">{player.champion}</div>
                    <div class="text-xxs text-center">{player.kills}/{player.deaths}/{player.assists}</div>
                </div>
            {/each}
        </div>
    </div>
</div>

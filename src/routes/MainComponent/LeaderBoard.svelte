<script>
    import { flip } from 'svelte/animate';

    export let rows = [];

    let currentSort = 'playedGames';
    let isAscending = true;

    function sortTable(sortKey) {
        if (currentSort === sortKey) {
            isAscending = !isAscending;
        } else {
            isAscending = true;
        }
        currentSort = sortKey;

        rows = [...rows].sort((a, b) => {
            let valueA = a[sortKey];
            let valueB = b[sortKey];

            if (sortKey === 'winningPercentage' || sortKey === 'kda') {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }

            if (!isNaN(valueA) && !isNaN(valueB)) {
                return isAscending ? valueA - valueB : valueB - valueA;
            }

            valueA = valueA?.toString().toLowerCase() ?? "";
            valueB = valueB?.toString().toLowerCase() ?? "";
            if (valueA < valueB) return isAscending ? -1 : 1;
            if (valueA > valueB) return isAscending ? 1 : -1;

            return 0;
        });
    }
</script>

<div class="overflow-x-auto overflow-y-auto max-h-[45vh] text-center rounded-xl" role="table">
    <div class="grid grid-cols-6 gap-4 bg-gray-700 dark:bg-gray-900 p-2 font-medium text-white uppercase cursor-pointer"
         role="row">
        <div on:click={() => sortTable('playedGames')} on:keypress role="columnheader" tabindex="0">게임수</div>
        <div on:click={() => sortTable('nickname')} on:keypress role="columnheader" tabindex="0">닉네임</div>
        <div on:click={() => sortTable('mostChampion')} on:keypress role="columnheader" tabindex="0">챔피언</div>
        <div on:click={() => sortTable('mostPosition')} on:keypress role="columnheader" tabindex="0">포지션</div>
        <div on:click={() => sortTable('winningPercentage')} on:keypress role="columnheader" tabindex="0">승률</div>
        <div on:click={() => sortTable('kda')} on:keypress role="columnheader" tabindex="0">KDA</div>
    </div>
    {#each rows as row (row["nickname"])}
        <div class="grid grid-cols-6 gap-4 p-2 border-b border-gray-600 dark:border-gray-700 bg-gray-800 dark:bg-gray-800 text-white sm:text-xxs"
             role="row" animate:flip={{ duration: 200 }} key={row["nickname"]}>
            <div class="text-xxs sm:text-xxs" role="cell">{row["playedGames"]}</div>
            <div class="text-xxs sm:text-xxs text-blue-400" role="cell">
                <a href="https://www.op.gg/summoners/kr/{row.nickname}" target="_blank">{row.nickname}</a>
            </div>
            <div class="text-xxs sm:text-xxs" role="cell">{row["mostChampion"]}</div>
            <div class="text-xxs sm:text-xxs" role="cell">{row["mostPosition"]}</div>
            <div class="text-xxs sm:text-xxs" role="cell">{row["winningPercentage"]}%</div>
            <div class="text-xxs sm:text-xxs" role="cell">{row["kda"]}</div>
        </div>
    {/each}
</div>

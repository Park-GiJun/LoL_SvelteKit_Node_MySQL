<script>
    import { get, writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import DetailMatch from "./Modal/DetailMatch.svelte";
    import pkg from 'lodash';
    const { debounce } = pkg;

    let searchQuery = '';
    let isDetailMatch = writable(false);

    let matchRecords = writable([]);
    let positionWinRates = writable([]);
    let mostPlayedChampions = writable([]);
    let highWinRatePlayers = writable([]);
    let isLoading = writable(true);
    let clickedMatch = [];

    async function fetchData() {
        try {
            await Promise.all([]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            isLoading.set(false);
        }
    }

    async function fetchDataByNickname(nickname) {
        try {
            const [matchRecordsRes, positionWinRatesRes, mostPlayedChampionsRes, highWinRatePlayersRes] = await Promise.all([
                fetch(`../PlayerSearch/api/select/MatchRecord?nickname=${encodeURIComponent(nickname)}`),
                fetch(`./PlayerSearch/api/select/PositionWinRate?nickname=${encodeURIComponent(nickname)}`),
                fetch(`./PlayerSearch/api/select/MostPlayedChampion?nickname=${encodeURIComponent(nickname)}`),
                fetch(`./PlayerSearch/api/select/HighWinRatePlayer?nickname=${encodeURIComponent(nickname)}`)
            ]);

            const matchRecordsData = await matchRecordsRes.json();
            const positionWinRatesData = await positionWinRatesRes.json();
            const mostPlayedChampionsData = await mostPlayedChampionsRes.json();
            const highWinRatePlayersData = await highWinRatePlayersRes.json();

            matchRecords.set(matchRecordsData);
            positionWinRates.set(positionWinRatesData);
            mostPlayedChampions.set(mostPlayedChampionsData);
            highWinRatePlayers.set(highWinRatePlayersData);
        } catch (error) {
            console.error('Error fetching data by nickname:', error);
        }
    }

    onMount(fetchData);

    async function handleSearch() {
        console.log(`Searching for: ${searchQuery}`);
        await fetchDataByNickname(searchQuery);
        searchQuery = '';
        nicknameSuggestions.set([]);
    }

    async function searchMatchDetail(matchCode) {
        const response = await fetch(`./PlayerSearch/api/select/MatchDetail?matchCode=${encodeURIComponent(matchCode)}`);
        clickedMatch = await response.json();
        isDetailMatch.set(true);
    }

    function closeModal() {
        isDetailMatch.set(false);
    }

    // Debounced function to fetch nickname suggestions
    async function fetchNicknameSuggestions(query) {
        if (query.trim().length < 2) {
            nicknameSuggestions.set([]);
            return;
        }

        const response = await fetch(`./SubComponent/api/select/search-nickname?query=${query}`);
        const suggestions = await response.json();
        nicknameSuggestions.set(suggestions);
    }

    const nicknameSuggestions = writable([]);
    let activeSuggestionIndex = -1;

    const debouncedFetchNicknameSuggestions = debounce(fetchNicknameSuggestions, 300);

    function handleKeydown(event, index) {
        let suggestions = get(nicknameSuggestions);
        if (event.key === 'ArrowDown') {
            activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, suggestions.length - 1);
        } else if (event.key === 'ArrowUp') {
            activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
        } else if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
            searchQuery = suggestions[activeSuggestionIndex];
            nicknameSuggestions.set([]);
            handleSearch();
        } else if (event.key === 'Escape') {
            searchQuery = '';
        }
    }
</script>

<div class="flex flex-col items-center h-[89.5vh]">
    <div class="w-full bg-gray-600 p-4 flex justify-center items-center rounded-2xl">
        <div class="flex gap-2 w-full max-w-md relative">
            <input
                    class="flex-grow p-2 border rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    type="text"
                    bind:value={searchQuery}
                    placeholder="검색어를 입력하세요."
                    on:input={() => debouncedFetchNicknameSuggestions(searchQuery)}
                    on:keydown={(e) => handleKeydown(e)}
            />
            <button
                    class="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                    on:click={handleSearch}
            >
                검색
            </button>

            {#if $nicknameSuggestions.length > 0}
                <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                    {#each $nicknameSuggestions as suggestion, index}
                        <li class="p-2 {index === activeSuggestionIndex ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 cursor-pointer'}"
                            on:click={() => { searchQuery = suggestion; nicknameSuggestions.set([]); handleSearch(); }}>
                            {suggestion}
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    {#if $isLoading}
        <p class="text-center mt-4 text-lg">Loading...</p>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full p-4 max-w-screen-2xl overflow-y-auto md:overflow-hidden">
            <!-- Position Win Rates -->
            <div class="bg-white p-4 rounded-lg shadow-md text-center w-full">
                <h2 class="text-center font-bold mb-4 bg-gray-300 py-2 rounded text-lg">포지션</h2>
                <div class="grid grid-cols-3 gap-2 font-bold border-gray-300 text-xs">
                    <div class="border-gray-300">포지션</div>
                    <div class=" border-gray-300">승률</div>
                    <div class=" border-gray-300">게임</div>
                </div>
                {#each $positionWinRates as rate}
                    <div class="grid grid-cols-3 gap-2 py-2 border-gray-300 text-xs">
                        <div class=" border-gray-300">{rate.position}</div>
                        <div class=" border-gray-300">{rate.winRate}</div>
                        <div>{rate.played}</div>
                    </div>
                {/each}
            </div>

            <!-- Most Played Champions -->
            <div class="bg-white p-4 rounded-lg shadow-md text-center w-full">
                <h2 class="text-center font-bold mb-4 bg-gray-300 py-2 rounded text-lg">챔피언</h2>
                <div class="grid grid-cols-4 gap-2 font-bold border-gray-300 text-xs">
                    <div class=" border-gray-300">챔피언</div>
                    <div class=" border-gray-300">KDA</div>
                    <div class=" border-gray-300">포지션</div>
                    <div class=" border-gray-300">승률</div>
                </div>
                {#each $mostPlayedChampions as champion}
                    <div class="grid grid-cols-4 gap-2 py-2 border-gray-300 text-xs">
                        <div class=" border-gray-300 text-ellipsis overflow-hidden whitespace-nowrap">{champion.champion}</div>
                        <div class=" border-gray-300">{champion.kda}</div>
                        <div class=" border-gray-300">{champion.position}</div>
                        <div class=" border-gray-300">{champion.winRate}</div>
                    </div>
                {/each}
            </div>

            <!-- High Win Rate Players -->
            <div class="bg-white p-4 rounded-lg shadow-md text-center w-full">
                <h2 class="text-center font-bold mb-4 bg-gray-300 py-2 rounded text-lg">친구</h2>
                <div class="grid grid-cols-3 gap-2 font-bold border-gray-300 text-xs">
                    <div class=" border-gray-300">닉네임</div>
                    <div class=" border-gray-300">승률</div>
                    <div class=" border-gray-300">게임</div>
                </div>
                {#each $highWinRatePlayers as player}
                    <div class="grid grid-cols-3 gap-2 py-2 border-gray-300 text-xs">
                        <div class=" border-gray-300">{player.player}</div>
                        <div class=" border-gray-300">{player.winRate}</div>
                        <div class=" border-gray-300">{player.played}</div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Match Records -->
        <div class="w-full max-w-4xl mt-8 overflow-y-auto p-2">
            {#each $matchRecords as record}
                <div class="p-4 m-2 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center {record.result === 'Win' ? 'bg-blue-200' : 'bg-pink-200'} text-xs"
                     role="button" tabindex="0" on:click={() => searchMatchDetail(record.match_code)}
                     on:keypress>
                    <div class="flex-grow mb-2 md:mb-0">
                        <p class="font-bold">{record.champion}</p>
                        <p>{record.kills} / {record.deaths} / {record.assists}</p>
                    </div>
                    <div class="flex  border-gray-300 pr-2 justify-center mb-2 md:mb-0">
                        <p>{record.position}</p>
                    </div>
                    <div class="text-right">
                        <p>{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if $isDetailMatch}
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog"
             aria-modal="true" on:click={closeModal} on:keydown={(e) => { if (e.key === 'Escape') closeModal(); }}>
            <div class="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full" role="document" on:click|stopPropagation>
                <DetailMatch match={clickedMatch} />
                <button class="mt-4 p-2 bg-gray-500 text-white rounded-lg float-right" on:click={closeModal}>Close</button>
            </div>
        </div>
    {/if}
</div>
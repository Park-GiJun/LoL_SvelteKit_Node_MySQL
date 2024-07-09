<script>
    import SettingModal from "../SubComponent/SettingModal.svelte";
    import { writable, get } from 'svelte/store';
    import pkg from 'lodash';
    import MatchCodeGenerator from "$lib/MatchCodeGenerator";

    const { debounce } = pkg;
    let games = writable([]);
    let showModal = true;

    function handleModalSubmit(event) {
        const { team1Names, team2Names, totalGames } = event.detail;
        const newGames = [];
        const positions = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

        for (let i = 0; i < totalGames; i++) {
            const blue = [];
            const red = [];

            for (let j = 0; j < 5; j++) {
                if (i % 2 === 0) {
                    blue.push({
                        nickname: team1Names[j],
                        position: positions[j],
                        champion: '',
                        kills: '',
                        deaths: '',
                        assists: '',
                        suggestions: [],
                        championSuggestions: [],
                        banSuggestions: [],
                        winning: 0
                    });
                    red.push({
                        nickname: team2Names[j],
                        position: positions[j],
                        champion: '',
                        kills: '',
                        deaths: '',
                        assists: '',
                        suggestions: [],
                        championSuggestions: [],
                        banSuggestions: [],
                        winning: 0
                    });
                } else {
                    blue.push({
                        nickname: team2Names[j],
                        position: positions[j],
                        champion: '',
                        kills: '',
                        deaths: '',
                        assists: '',
                        suggestions: [],
                        championSuggestions: [],
                        banSuggestions: [],
                        winning: 0
                    });
                    red.push({
                        nickname: team1Names[j],
                        position: positions[j],
                        champion: '',
                        kills: '',
                        deaths: '',
                        assists: '',
                        suggestions: [],
                        championSuggestions: [],
                        banSuggestions: [],
                        winning: 0
                    });
                }
            }

            newGames.push({
                blueTeam: blue,
                redTeam: red,
                blueBans: Array(5).fill(''),
                redBans: Array(5).fill(''),
                blueBanSuggestions: Array(5).fill([]),
                redBanSuggestions: Array(5).fill([]),
                winningTeam: ''
            });
        }

        games.set(newGames);
        showModal = false;
    }

    function handleModalClose() {
        showModal = false;
    }

    async function saveGame(gameIndex) {
        const game = get(games)[gameIndex];
        console.log('Saving game:', game);

        let matchCode;
        let existMatchCode;

        do {
            matchCode = MatchCodeGenerator.generateMatchCodeWithUUID();
            console.log('Generated match code:', matchCode);
            existMatchCode = await fetch(`../SaveMatch/api/select/MatchCode?query=${matchCode}`)
                .then(res => res.json())
                .then(data => data.exists);
        } while (existMatchCode);

        console.log('Unique match code:', matchCode);

        const blueTeam = game.blueTeam.map(player => ({
            ...player,
            winning: game.winningTeam === 'blue' ? 1 : 0
        }));
        const redTeam = game.redTeam.map(player => ({
            ...player,
            winning: game.winningTeam === 'red' ? 1 : 0
        }));

        const bans = [
            ...game.blueBans.map(ban => ({ banChampion: ban, banTeamColor: 'blue' })),
            ...game.redBans.map(ban => ({ banChampion: ban, banTeamColor: 'red' }))
        ];

        const saveGameResponse = await fetch('../SaveMatch/api/insert/SaveMatch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matchCode: matchCode,
                blueTeam: blueTeam,
                redTeam: redTeam,
                winning: game.winningTeam
            })
        });

        const saveGameResult = await saveGameResponse.json();
        console.log('Save game response:', saveGameResult);

        const saveBansResponse = await fetch('../SaveMatch/api/insert/Ban', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                matchCode: matchCode,
                bans: bans
            })
        });

        const saveBansResult = await saveBansResponse.json();
        console.log('Save bans response:', saveBansResult);
    }

    async function fetchSuggestions(type, team, index, gameIndex, isBan = false) {
        const currentGames = get(games);
        let query;
        if (isBan) {
            query = team === 'blueTeam' ? currentGames[gameIndex].blueBans[index] : currentGames[gameIndex].redBans[index];
        } else {
            query = type === 'nickname'
                ? (team === 'blueTeam' ? currentGames[gameIndex].blueTeam[index].nickname : currentGames[gameIndex].redTeam[index].nickname)
                : (team === 'blueTeam' ? currentGames[gameIndex].blueTeam[index].champion : currentGames[gameIndex].redTeam[index].champion);
        }

        if (query.trim().length < 2) {
            if (isBan) {
                if (team === 'blueTeam') {
                    currentGames[gameIndex].blueBanSuggestions[index] = [];
                } else {
                    currentGames[gameIndex].redBanSuggestions[index] = [];
                }
            } else if (type === 'nickname') {
                if (team === 'blueTeam') {
                    currentGames[gameIndex].blueTeam[index].suggestions = [];
                } else {
                    currentGames[gameIndex].redTeam[index].suggestions = [];
                }
            } else {
                if (team === 'blueTeam') {
                    currentGames[gameIndex].blueTeam[index].championSuggestions = [];
                } else {
                    currentGames[gameIndex].redTeam[index].championSuggestions = [];
                }
            }
            games.set(currentGames);
            return;
        }

        const res = await fetch(`/SubComponent/api/select/search-${type}?query=${query}`);
        const suggestions = await res.json();

        if (isBan) {
            if (team === 'blueTeam') {
                currentGames[gameIndex].blueBanSuggestions[index] = suggestions;
            } else {
                currentGames[gameIndex].redBanSuggestions[index] = suggestions;
            }
        } else if (type === 'nickname') {
            if (team === 'blueTeam') {
                currentGames[gameIndex].blueTeam[index].suggestions = suggestions;
            } else {
                currentGames[gameIndex].redTeam[index].suggestions = suggestions;
            }
        } else {
            if (team === 'blueTeam') {
                currentGames[gameIndex].blueTeam[index].championSuggestions = suggestions;
            } else {
                currentGames[gameIndex].redTeam[index].championSuggestions = suggestions;
            }
        }
        games.set(currentGames);
    }

    const debouncedFetchSuggestions = debounce(fetchSuggestions, 100);

    function handleKeydown(event, type, team, index, gameIndex, isBan = false) {
        const currentGames = get(games);
        let suggestions;
        if (isBan) {
            suggestions = team === 'blueTeam'
                ? currentGames[gameIndex].blueBanSuggestions[index]
                : currentGames[gameIndex].redBanSuggestions[index];
        } else {
            suggestions = type === 'nickname'
                ? (team === 'blueTeam' ? currentGames[gameIndex].blueTeam[index].suggestions : currentGames[gameIndex].redTeam[index].suggestions)
                : (team === 'blueTeam' ? currentGames[gameIndex].blueTeam[index].championSuggestions : currentGames[gameIndex].redTeam[index].championSuggestions);
        }

        if (event.key === 'ArrowDown') {
            activeSuggestionIndex[index] = Math.min(activeSuggestionIndex[index] + 1, suggestions.length - 1);
        } else if (event.key === 'ArrowUp') {
            activeSuggestionIndex[index] = Math.max(activeSuggestionIndex[index] - 1, 0);
        } else if (event.key === 'Enter') {
            if (isBan) {
                if (team === 'blueTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].blueBans[index] = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].blueBanSuggestions[index] = [];
                } else if (team === 'redTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].redBans[index] = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].redBanSuggestions[index] = [];
                }
            } else if (type === 'nickname') {
                if (team === 'blueTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].blueTeam[index].nickname = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].blueTeam[index].suggestions = [];
                } else if (team === 'redTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].redTeam[index].nickname = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].redTeam[index].suggestions = [];
                }
            } else {
                if (team === 'blueTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].blueTeam[index].champion = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].blueTeam[index].championSuggestions = [];
                } else if (team === 'redTeam' && activeSuggestionIndex[index] >= 0) {
                    currentGames[gameIndex].redTeam[index].champion = suggestions[activeSuggestionIndex[index]];
                    currentGames[gameIndex].redTeam[index].championSuggestions = [];
                }
            }
        }
        games.set(currentGames);
    }

    let activeSuggestionIndex = Array(5).fill(-1);
</script>

<div class="h-screen overflow-hidden text-white text-sm rounded-2xl gap-2">
    {#if showModal}
        <SettingModal on:submit={handleModalSubmit} on:close={handleModalClose} />
    {:else}
        <div class="overflow-y-auto h-full p-4">
            {#each $games as game, gameIndex}
                <div class="bg-gray-600 p-4 mb-8 rounded">
                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div>
                            <div class="text-xl font-bold mb-4">블루팀</div>
                            <div class="grid grid-cols-5 gap-2 text-center font-semibold mb-2">
                                <div>닉네임</div>
                                <div>챔피언</div>
                                <div>킬</div>
                                <div>데스</div>
                                <div>어시스트</div>
                            </div>
                            {#each game.blueTeam as player, i}
                                <div class="grid grid-cols-5 gap-2 text-center mb-2 p-2 bg-gray-800 rounded">
                                    <div class="relative">
                                        <label for={`nickname-${gameIndex}-${i}`} class="sr-only">Nickname</label>
                                        <input id={`nickname-${gameIndex}-${i}`} type="text" inputmode="text"
                                               class="p-1 bg-gray-700 rounded text-xs w-full"
                                               bind:value={player.nickname}
                                               on:input={() => debouncedFetchSuggestions('nickname', 'blueTeam', i, gameIndex)}
                                               on:keydown={(event) => handleKeydown(event, 'nickname', 'blueTeam', i, gameIndex)} />
                                        {#if player.suggestions.length > 0}
                                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                {#each player.suggestions as suggestion, index}
                                                    <li class="p-2">
                                                        <button type="button"
                                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                on:click={() => { player.nickname = suggestion; player.suggestions = []; }}>
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </div>
                                    <div class="relative">
                                        <label for={`champion-${gameIndex}-${i}`} class="sr-only">Champion</label>
                                        <input id={`champion-${gameIndex}-${i}`} type="text" inputmode="text"
                                               class="p-1 bg-gray-700 rounded text-xs w-full"
                                               bind:value={player.champion}
                                               on:input={() => debouncedFetchSuggestions('champion', 'blueTeam', i, gameIndex)}
                                               on:keydown={(event) => handleKeydown(event, 'champion', 'blueTeam', i, gameIndex)} />
                                        {#if player.championSuggestions.length > 0}
                                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                {#each player.championSuggestions as suggestion, index}
                                                    <li class="p-2">
                                                        <button type="button"
                                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                on:click={() => { player.champion = suggestion; player.championSuggestions = []; }}>
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.kills} /></div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.deaths} /></div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.assists} /></div>
                                </div>
                            {/each}
                            <div class="flex items-center mb-4">
                                <input type="radio" id={`winning-blue-${gameIndex}`} name={`winning-${gameIndex}`} class="mr-2"
                                       value="blue" bind:group={game.winningTeam} />
                                <label for={`winning-blue-${gameIndex}`}>블루팀 승리</label>
                            </div>
                            <div>
                                <div class="grid grid-cols-5 gap-2">
                                    {#each game.blueBans as ban, i}
                                        <div class="relative">
                                            <label for={`blue-ban-${gameIndex}-${i}`} class="sr-only">Blue Ban {i + 1}</label>
                                            <input id={`blue-ban-${gameIndex}-${i}`} type="text" inputmode="text" placeholder={`밴 ${i + 1}번`}
                                                   class="p-1 bg-gray-700 rounded text-xs w-full"
                                                   bind:value={game.blueBans[i]}
                                                   on:input={() => debouncedFetchSuggestions('champion', 'blueTeam', i, gameIndex, true)}
                                                   on:keydown={(event) => handleKeydown(event, 'champion', 'blueTeam', i, gameIndex, true)} />
                                            {#if game.blueBanSuggestions[i].length > 0}
                                                <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                    {#each game.blueBanSuggestions[i] as suggestion, index}
                                                        <li class="p-2">
                                                            <button type="button"
                                                                    class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                    on:click={() => { game.blueBans[i] = suggestion; game.blueBanSuggestions[i] = []; }}>
                                                                {suggestion}
                                                            </button>
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="text-xl font-bold mb-4">레드팀</div>
                            <div class="grid grid-cols-5 gap-2 text-center font-semibold mb-2">
                                <div>닉네임</div>
                                <div>챔피언</div>
                                <div>킬</div>
                                <div>데스</div>
                                <div>어시스트</div>
                            </div>
                            {#each game.redTeam as player, i}
                                <div class="grid grid-cols-5 gap-2 text-center mb-2 p-2 bg-gray-800 rounded">
                                    <div class="relative">
                                        <label for={`red-nickname-${gameIndex}-${i}`} class="sr-only">Nickname</label>
                                        <input id={`red-nickname-${gameIndex}-${i}`} type="text" inputmode="text"
                                               class="p-1 bg-gray-700 rounded text-xs w-full"
                                               bind:value={player.nickname}
                                               on:input={() => debouncedFetchSuggestions('nickname', 'redTeam', i, gameIndex)}
                                               on:keydown={(event) => handleKeydown(event, 'nickname', 'redTeam', i, gameIndex)} />
                                        {#if player.suggestions.length > 0}
                                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                {#each player.suggestions as suggestion, index}
                                                    <li class="p-2">
                                                        <button type="button"
                                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                on:click={() => { player.nickname = suggestion; player.suggestions = []; }}>
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </div>
                                    <div class="relative">
                                        <label for={`red-champion-${gameIndex}-${i}`} class="sr-only">Champion</label>
                                        <input id={`red-champion-${gameIndex}-${i}`} type="text" inputmode="text"
                                               class="p-1 bg-gray-700 rounded text-xs w-full"
                                               bind:value={player.champion}
                                               on:input={() => debouncedFetchSuggestions('champion', 'redTeam', i, gameIndex)}
                                               on:keydown={(event) => handleKeydown(event, 'champion', 'redTeam', i, gameIndex)} />
                                        {#if player.championSuggestions.length > 0}
                                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                {#each player.championSuggestions as suggestion, index}
                                                    <li class="p-2">
                                                        <button type="button"
                                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                on:click={() => { player.champion = suggestion; player.championSuggestions = []; }}>
                                                            {suggestion}
                                                        </button>
                                                    </li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.kills} /></div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.deaths} /></div>
                                    <div><input type="text" inputmode="text"
                                                class="p-1 bg-gray-700 rounded text-xs w-full"
                                                bind:value={player.assists} /></div>
                                </div>
                            {/each}
                            <div class="flex items-center mb-4">
                                <input type="radio" id={`winning-red-${gameIndex}`} name={`winning-${gameIndex}`} class="mr-2"
                                       value="red" bind:group={game.winningTeam} />
                                <label for={`winning-red-${gameIndex}`}>레드팀 승리</label>
                            </div>
                            <div>
                                <div class="grid grid-cols-5 gap-2">
                                    {#each game.redBans as ban, i}
                                        <div class="relative">
                                            <label for={`red-ban-${gameIndex}-${i}`} class="sr-only">Red Ban {i + 1}</label>
                                            <input id={`red-ban-${gameIndex}-${i}`} type="text" inputmode="text" placeholder={`밴 ${i + 1}번`}
                                                   class="p-1 bg-gray-700 rounded text-xs w-full"
                                                   bind:value={game.redBans[i]}
                                                   on:input={() => debouncedFetchSuggestions('champion', 'redTeam', i, gameIndex, true)}
                                                   on:keydown={(event) => handleKeydown(event, 'champion', 'redTeam', i, gameIndex, true)} />
                                            {#if game.redBanSuggestions[i].length > 0}
                                                <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                                    {#each game.redBanSuggestions[i] as suggestion, index}
                                                        <li class="p-2">
                                                            <button type="button"
                                                                    class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                                    on:click={() => { game.redBans[i] = suggestion; game.redBanSuggestions[i] = []; }}>
                                                                {suggestion}
                                                            </button>
                                                        </li>
                                                    {/each}
                                                </ul>
                                            {/if}
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                on:click={() => saveGame(gameIndex)}>
                            저장
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .selected {
        background-color: #3182ce;
        color: white;
    }
</style>

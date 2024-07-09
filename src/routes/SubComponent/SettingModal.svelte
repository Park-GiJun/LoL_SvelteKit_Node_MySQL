<script>
    import { createEventDispatcher } from 'svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import pkg from 'lodash';

    const { debounce } = pkg;
    let team1Names = ['', '', '', '', ''];
    let team2Names = ['', '', '', '', ''];
    let totalGames = 1;
    let team1Suggestions = Array(5).fill([]);
    let team2Suggestions = Array(5).fill([]);
    let activeSuggestionIndex = Array(5).fill(-1);
    const dispatch = createEventDispatcher();

    onMount(() => {
        const now = new Date();

// YYYY-MM-DD HH:MM:SS 형식으로 출력
        const formattedDate = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + ' ' +
            String(now.getHours()).padStart(2, '0') + ':' +
            String(now.getMinutes()).padStart(2, '0') + ':' +
            String(now.getSeconds()).padStart(2, '0');

        console.log(formattedDate);

        team1Suggestions = team1Names.map(() => []);
        team2Suggestions = team2Names.map(() => []);
    });

    function submit() {
        dispatch('submit', {team1Names, team2Names, totalGames});
    }

    function close() {
        dispatch('close');
        goto('/');
    }

    async function fetchSuggestions(team, index) {
        const name = team === 'team1' ? team1Names[index] : team2Names[index];
        if (name.trim().length < 2) {
            if (team === 'team1') {
                team1Suggestions[index] = [];
            } else {
                team2Suggestions[index] = [];
            }
            activeSuggestionIndex[index] = -1;
            return;
        }

        const res = await fetch(`/SubComponent/api/select/search-nickname?query=${name}`);
        const suggestions = await res.json();

        if (team === 'team1') {
            team1Suggestions[index] = suggestions;
        } else {
            team2Suggestions[index] = suggestions;
        }
        activeSuggestionIndex[index] = -1;
    }

    function handleKeydown(event, team, index) {
        if (event.key === 'ArrowDown') {
            activeSuggestionIndex[index] = Math.min(activeSuggestionIndex[index] + 1, team === 'team1' ? team1Suggestions[index].length - 1 : team2Suggestions[index].length - 1);
        } else if (event.key === 'ArrowUp') {
            activeSuggestionIndex[index] = Math.max(activeSuggestionIndex[index] - 1, 0);
        } else if (event.key === 'Enter') {
            if (team === 'team1' && activeSuggestionIndex[index] >= 0) {
                team1Names[index] = team1Suggestions[index][activeSuggestionIndex[index]];
                team1Suggestions[index] = [];
            } else if (team === 'team2' && activeSuggestionIndex[index] >= 0) {
                team2Names[index] = team2Suggestions[index][activeSuggestionIndex[index]];
                team2Suggestions[index] = [];
            }
        }
    }

    const debouncedFetchSuggestions = debounce(fetchSuggestions, 100);
</script>

<div class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div class="bg-gray-700 p-6 rounded-lg shadow-lg relative modal-container">
        <h2 class="text-xl text-white mb-2">팀 구성 설정</h2>
        <div class="flex mb-2">
            <div class="w-1/2 pr-1">
                <label class="block text-white mb-1" for="team1-names">1팀 닉네임</label>
                {#each team1Names as name, i}
                    <div class="relative mb-1">
                        <input type="text" id={`team1-name-${i}`} bind:value={team1Names[i]}
                               class="p-2 w-full bg-gray-600 text-white rounded" placeholder={`닉네임 ${i + 1}`}
                               on:input={() => debouncedFetchSuggestions('team1', i)}
                               on:keydown={(event) => handleKeydown(event, 'team1', i)}/>
                        {#if team1Suggestions[i].length > 0}
                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                {#each team1Suggestions[i] as suggestion, index}
                                    <li class="p-2">
                                        <button type="button"
                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                on:click={() => { team1Names[i] = suggestion; team1Suggestions[i] = []; }}>
                                            {suggestion}
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </div>
                {/each}
            </div>
            <div class="w-1/2 pl-1">
                <label class="block text-white mb-1" for="team2-names">2팀 닉네임</label>
                {#each team2Names as name, i}
                    <div class="relative mb-1">
                        <input type="text" id={`team2-name-${i}`} bind:value={team2Names[i]}
                               class="p-2 w-full bg-gray-600 text-white rounded" placeholder={`닉네임 ${i + 1}`}
                               on:input={() => debouncedFetchSuggestions('team2', i)}
                               on:keydown={(event) => handleKeydown(event, 'team2', i)}/>
                        {#if team2Suggestions[i].length > 0}
                            <ul class="absolute top-full left-0 right-0 bg-white text-black rounded mt-1 z-10 max-h-40 overflow-auto shadow-lg">
                                {#each team2Suggestions[i] as suggestion, index}
                                    <li class="p-2">
                                        <button type="button"
                                                class="w-full text-left p-2 hover:bg-gray-200 cursor-pointer {index === activeSuggestionIndex[i] ? 'bg-blue-500 text-white' : ''}"
                                                on:click={() => { team2Names[i] = suggestion; team2Suggestions[i] = []; }}>
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
        <div class="mb-2">
            <label class="block text-white mb-1" for="total-games">총 게임 수</label>
            <input type="number" id="total-games" bind:value={totalGames} min="1"
                   class="p-2 w-full bg-gray-600 text-white rounded"/>
        </div>
        <div class="flex justify-end space-x-2">
            <button on:click={close} class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">취소
            </button>
            <button on:click={submit} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">확인
            </button>
        </div>
    </div>
</div>

<style>
    .modal-container {
        max-width: 600px;
        width: 90%;
    }

    .selected {
        background-color: #3182ce;
        color: white;
    }
</style>

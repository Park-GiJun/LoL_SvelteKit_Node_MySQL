<script>
    import { onMount } from 'svelte';
    import AnnouncementModal from "./SubComponent/AnnouncementModal.svelte";
    import Card from "./MainComponent/Card.svelte";
    import MatchInfo from "./MainComponent/MatchInfo.svelte";
    import LeaderBoard from "./MainComponent/LeaderBoard.svelte";
    import { writable } from 'svelte/store';

    let cards = [];
    let recentMatch = writable([]);
    let leaderBoardData = writable([]);
    let isLoading = writable(true);

    let showCards = writable(true);
    let showMatchInfo = writable(true);

    let announcement = null;
    let showModal = writable(false);

    onMount(async () => {
        const doNotShowUntil = localStorage.getItem('doNotShowAnnouncement');
        const now = new Date();

        const dataPromises = [
            fetch('./api/select/Card').then(res => res.json()),
            fetch('./api/select/MatchInfo').then(res => res.json()),
            fetch('./api/select/LeaderBoard').then(res => res.json())
        ];

        if (!doNotShowUntil || new Date(doNotShowUntil) <= now) {
            dataPromises.push(fetch('./api/select/Announcement').then(res => res.json()));
        }

        try {
            const [cardsData, matchData, leaderBoardDataRes, announcementData = []] = await Promise.all(dataPromises);

            recentMatch.set(matchData);
            leaderBoardData.set(leaderBoardDataRes);

            if (announcementData.length > 0) {
                announcement = announcementData[0];
                showModal.set(true);
            }

            cards = [
                { header: 'Game', value: cardsData[0]["totalGamesPlayed"] },
                { header: 'Days', value: cardsData[0]["totalDaysPlayed"] },
                { header: 'Champion', value: cardsData[0]["mostPlayedChampion"] },
                { header: 'Kill', value: cardsData[0]["mostKillsChampion"] },
                { header: 'Death', value: cardsData[0]["mostDeathsChampion"] },
                { header: 'KDA', value: cardsData[0]["bestKDAChampion"] }
            ];

            isLoading.set(false);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    });

    function toggleShowCards() {
        showCards.update(value => !value);
    }

    function toggleShowMatchInfo() {
        showMatchInfo.update(value => !value);
    }

    function closeModal() {
        showModal.set(false);
    }
</script>

<div class="p-4 dark:bg-gray-900 text-center">
    {#if $showModal && announcement}
        <AnnouncementModal {announcement} onClose={closeModal} />
    {/if}

    <div class="mb-4">
        <button class="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:hidden"
                on:click={toggleShowCards}>
            {#if $showCards} Hide Cards{/if}
            {#if !$showCards} Show Cards{/if}
        </button>
    </div>

    {#if $showCards || $isLoading}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            {#each cards as card}
                <div class="col-span-1 p-4">
                    <Card header={card.header} value={card.value} class="bg-gray-800 dark:bg-gray-700 text-white"/>
                </div>
            {/each}
        </div>
    {/if}

    <div class="my-2">
        <button class="px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs lg:hidden"
                on:click={toggleShowMatchInfo}>
            {#if $showMatchInfo} Hide Match Info{/if}
            {#if !$showMatchInfo} Show Match Info{/if}
        </button>
    </div>

    {#if $showMatchInfo && !$isLoading}
        <div class="lg:grid lg:grid-cols-6 gap-2">
            <div class="col-span-1 sm:col-span-2 lg:col-span-6">
                <MatchInfo {recentMatch}/>
            </div>
        </div>
    {/if}

    <div class="col-span-1 sm:col-span-2 lg:col-span-6">
        <LeaderBoard rows={$leaderBoardData}/>
    </div>

    {#if $isLoading}
        <div class="col-span-1 sm:col-span-2 lg:col-span-6">
            <p class="text-white">Loading...</p>
        </div>
    {/if}
</div>

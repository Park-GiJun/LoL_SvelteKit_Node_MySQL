<script>
    import Calendar from '../SubComponent/Calendar.svelte';
    import { availableDates, setDate, selectedDate } from '$lib/store/calender.js';
    import { onMount } from 'svelte';
    import { get } from "svelte/store";

    let isLoading = true;

    onMount(async () => {
        const dateListResponse = await fetch('../Matches/api/select/matchDate');
        const dateList = await dateListResponse.json();
        availableDates.set(dateList.map(item => item.date));
        selectedDate.set(get(availableDates)[0]);
        isLoading = false;
    });
</script>

<main class="p-8">
    {#if isLoading}
        <p>Loading...</p>
    {:else}
        <Calendar />
    {/if}
</main>

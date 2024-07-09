<script>
    import { onMount } from 'svelte';
    import { selectedDate, availableDates, setDate, matchData, setMatchData } from '$lib/store/calender.js';
    import { get } from 'svelte/store';
    import MatchDetails from './MatchDetails.svelte';
    import {findLastIndex} from "lodash";

    let currentYear;
    let currentMonth;
    let dates = [];
    let matches = [];
    let groupedMatches = {};
    let isCalendarVisible = false;

    onMount(() => {
        dates = get(availableDates).map(item => new Date(item).toISOString().split('T')[0]);
        matches = get(matchData);
        if (dates.length > 0) {
            setDate(dates[dates.length - 1]);
        }
        const lastDate = dates[dates.length - 1];
        currentYear = parseInt(lastDate.split('-')[0], 10);
        currentMonth = parseInt(lastDate.split('-')[1], 10) - 1;
    });

    $: fetchMatches();

    async function fetchMatches() {
        if ($selectedDate) {
            const response = await fetch(`../Matches/api/select/matchData?date=${$selectedDate}`);
            const data = await response.json();
            setMatchData(data);

            groupedMatches = groupByMatchCode(data);
        }
    }

    function groupByMatchCode(data) {
        return data.reduce((acc, curr) => {
            const { match_code } = curr;
            if (!acc[match_code]) {
                acc[match_code] = [];
            }
            acc[match_code].push(curr);
            return acc;
        }, {});
    }

    function previousMonth() {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear -= 1;
        } else {
            currentMonth -= 1;
        }
    }

    function nextMonth() {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear += 1;
        } else {
            currentMonth += 1;
        }
    }

    function toggleCalendar() {
        isCalendarVisible = !isCalendarVisible;
    }

    function getMonthName(month) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[month];
    }

    function generateCalendar(year, month) {
        const firstDayOfMonth = new Date(year, month, 0).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const calendar = [];
        let week = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            week.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day).toISOString().split('T')[0];
            week.push(date);
            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }

        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            calendar.push(week);
        }

        return calendar;
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

<div class="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-2">
        <button class="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none text-sm" on:click={toggleCalendar}>
            {isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}
        </button>
    </div>

    {#if isCalendarVisible}
        <div>
            <div class="flex justify-between items-center mb-2">
                <button class="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none text-sm" on:click={previousMonth}>
                    &lt;
                </button>
                <span class="text-md font-bold text-gray-900 dark:text-gray-100">
                    {getMonthName(currentMonth)} {currentYear}
                </span>
                <button class="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none text-sm" on:click={nextMonth}>
                    &gt;
                </button>
            </div>

            <div class="grid grid-cols-7 gap-1 mb-2 text-sm">
                {#each weekDays as day}
                    <div class="text-center font-bold">{day}</div>
                {/each}
            </div>

            <div class="grid grid-cols-7 gap-1 text-xs">
                {#each generateCalendar(currentYear, currentMonth) as week}
                    {#each week as date}
                        {#if date}
                            <button
                                    class={`p-1 border rounded-lg text-center focus:outline-none
                                ${date === $selectedDate ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-gray-200'}
                                ${dates.includes(date) ? 'hover:bg-gray-400 dark:hover:bg-gray-600' : 'opacity-50 cursor-not-allowed'}`}
                                    on:click={() => { setDate(date); fetchMatches(); }}
                                    disabled={!dates.includes(date)}
                            >
                                {new Date(date).getDate()}
                            </button>
                        {:else}
                            <button class="p-1 border rounded-lg bg-transparent cursor-not-allowed" disabled></button>
                        {/if}
                    {/each}
                {/each}
            </div>
        </div>
    {/if}

    <div class="bg-white dark:bg-gray-700 p-2 rounded-lg shadow-md overflow-y-auto mt-3" style="max-height: {isCalendarVisible ? 'h-[30vh]' : 'h-[50vh]'};">
        {#if Object.keys(groupedMatches).length > 0}
            {#each Object.keys(groupedMatches) as match_code}
                <div class="mb-2">
                    <MatchDetails match={groupedMatches[match_code]} />
                </div>
            {/each}
        {:else}
            <p class="text-gray-600 dark:text-gray-300">No matches found for the selected date.</p>
        {/if}
    </div>
</div>

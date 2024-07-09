<script>
    import { createEventDispatcher } from 'svelte';

    let isOpen = false;
    const dispatch = createEventDispatcher();

    function toggleMenu() {
        isOpen = !isOpen;
        dispatch('toggle', { isOpen });
    }
</script>

<header class="bg-gray-800 dark:bg-gray-900 text-white p-4 w-full">
    <div class="flex justify-between items-center {isOpen ? 'mb-4' : ''}">
        <div class="text-2xl font-bold">OLM<small class="text-xs">오롤몇</small></div>
        <button class="focus:outline-none" on:click={toggleMenu}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
        </button>
    </div>
    {#if isOpen}
        <nav class="flex flex-col space-y-4">
            <div class="relative">
                <input type="text" class="w-full p-2 pr-10 rounded bg-gray-700 dark:bg-gray-800 text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out" placeholder="닉네임"/>
                <button class="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none">
                    <svg fill="#ffffff" width="20px" viewBox="0 0 490.4 490.4" xmlns="http://www.w3.org/2000/svg">
                        <path d="M484.1,454.796l-110.5-110.6c29.8-36.3,47.6-82.8,47.6-133.4c0-116.3-94.3-210.6-210.6-210.6S0,94.496,0,210.796 s94.3,210.6,210.6,210.6c50.8,0,97.4-18,133.8-48l110.5,110.5c12.9,11.8,25,4.2,29.2,0C492.5,475.596,492.5,463.096,484.1,454.796z M41.1,210.796c0-93.6,75.9-169.5,169.5-169.5s169.6,75.9,169.6,169.5s-75.9,169.5-169.5,169.5S41.1,304.396,41.1,210.796z"></path>
                    </svg>
                </button>
            </div>
            <ul>
                <li>
                    <a href="/" class="block py-2 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition duration-200 ease-in-out">홈</a>
                </li>
                <li>
                    <a href="/PlayerSearch" class="block py-2 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition duration-200 ease-in-out">전적 검색</a>
                </li>
                <li>
                    <a href="/Archive" class="block py-2 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition duration-200 ease-in-out">기록실</a>
                </li>
                <li>
                    <a href="/Matches" class="block py-2 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition duration-200 ease-in-out">경기</a>
                </li>
                <li>
                    <a href="/SaveMatch" class="block py-2 px-4 hover:bg-gray-700 dark:hover:bg-gray-800 rounded transition duration-200 ease-in-out">게임 저장</a>
                </li>
            </ul>
        </nav>
    {/if}
</header>

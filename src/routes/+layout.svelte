<script>
    import '../app.css';
    import Header from "./Header.svelte";
    import MobileHeader from "./MobileHeader.svelte";
    import { onMount } from "svelte";

    let isMobile = false;

    onMount(() => {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    });

    function checkMobile() {
        isMobile = window.innerWidth <= 1024;
    }
</script>

<div class="flex bg-gray-300 dark:bg-gray-900">
    {#if isMobile}
        <div class="w-screen">
            <MobileHeader />
            <div class="p-4 transition-all duration-300 ease-in-out overflow-x-hidden">
                <slot/>
            </div>
        </div>
    {:else}
        <Header />
        <div class="flex flex-col flex-grow p-4 transition-all duration-300 ease-in-out">
            <slot/>
        </div>
    {/if}
</div>

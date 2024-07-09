<script>
    export let announcement;
    export let onClose;

    let doNotShowToday = false;

    function handleClose() {
        if (doNotShowToday) {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            localStorage.setItem('doNotShowAnnouncement', tomorrow.toString());
        }
        onClose();
    }
</script>

<div class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md dark:bg-gray-700">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{announcement.title}</h2>
        <p class="mb-4 text-gray-700 dark:text-gray-300"> {@html announcement.content}</p>
        <div class="flex items-center mb-4">
            <input type="checkbox" id="doNotShow" bind:checked={doNotShowToday} class="mr-2" />
            <label for="doNotShow" class="text-gray-700 dark:text-gray-300 text-sm">오늘 다시 보지 않기</label>
        </div>
        <button on:click={handleClose} class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto">확인</button>
    </div>
</div>

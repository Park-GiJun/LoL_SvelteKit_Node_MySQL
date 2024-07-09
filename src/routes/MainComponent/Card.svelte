<script>
    export let header = '';
    export let value = '';
    export let className = '';
</script>

<div class={`bg-gray-700 text-white shadow-md rounded-lg p-4 sm:p-6 transition duration-200 ease-in-out hover:bg-gray-600 dark:bg-gray-800 dark:text-white ${className}`}>
    <div class="text-sm sm:text-base font-bold mb-2 sm:mb-4">{header}</div>
    <div class="text-xs sm:text-sm">{value}</div>
</div>

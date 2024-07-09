import { writable } from 'svelte/store';

export const selectedDate = writable('');
export const availableDates = writable([]);
export const matchData = writable([]);

export function setDate(date) {
    selectedDate.set(date);
}

export function setMatchData(data) {
    matchData.set(data);
}

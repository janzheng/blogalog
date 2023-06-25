import { writable } from 'svelte/store'
import * as localStorage from "svelte-local-storage-store";

export const currentPage = writable('')
export const isMenuOpen = writable(false)

export const authProvider = localStorage.writable('authProvider', '') 

export const user = writable(null)


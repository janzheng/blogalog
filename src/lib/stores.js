import { writable } from 'svelte/store'
import { persisted } from 'svelte-persisted-store'

export const currentPage = writable('')
// export const isMenuOpen = writable(false)

export const userData = persisted('user', {}) 


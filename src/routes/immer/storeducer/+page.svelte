
<!-- 

  mostly from: https://egghead.io/lessons/react-render-immutable-data-using-react


 -->

<div class="container mx-auto p-8">
  <h1 class="text-2xl">Immer stuff</h1>

  <div class="gift-list">
    <div class="user">
      <h2 class="text-lg mb-8">Hello, {$giftStore.currentUser.name}</h2>
      <div class="actions mb-4">
        <button class="Btn-solid " on:click={()=>handleAdd()}>
          Add Gift
        </button>
        <button class="Btn-solid " on:click={()=>handleAddBook()}>
          Add Book
        </button>
        <button class="Btn-solid " on:click={()=>handleReset()}>
          Reset
        </button>
      </div>
      <div class="gifts">
        {#each $giftStore.gifts as gift}
          <div class="mb-4">
            <Gift {gift} currentUser={$giftStore.currentUser} users={$giftStore.users} {handleReserve}/>
          </div>
        {/each}
      </div>
    </div> 
  </div>
</div>

<script>

  import { produce, produceWithPatches, applyPatches } from "immer"
  import {enablePatches} from "immer"
  enablePatches()


  import Gift from "./Gift.svelte"

  function handleReserve (giftId) {
    dispatch({
      type: "TOGGLE_RESERVATION",
      id: giftId
    })
  }

  function handleAdd () {
    const description = prompt("Gift to add")
    if(description) {
      // basic addGift producer
      dispatch({
        type: "ADD_GIFT",
        id: Date.now().toString(),
        description,
        image: "https://picsum.photos/200?q=" + Math.random(),
        reservedBy: undefined
      })
      console.log('handleAdd giftStore', $giftStore)
    }
  }

  function handleReset() {
    dispatch({
      type: "RESET"
    })
  }

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025")
    if (isbn) {
      const book = await getBookDetails(isbn)
      dispatch({
        type: "ADD_BOOK",
        book
      })
    }
  }



  // gifts.js too lazy to move this
  // these return produce while the above just equals it / doesn't get original state
  // export function addGiftStateFn(state, id, description, image) {
  //   return produce(state, draft => {
  //     draft.gifts.push({
  //       id,
  //       description,
  //       image,
  //       reservedBy: undefined
  //     })
  //   })
  // }

  export function toggleReservationStateFn(state, giftId) {
    return produce(state, draft => {
      const gift = draft.gifts.find(gift => gift.id === giftId)
      gift.reservedBy =
        gift.reservedBy === undefined
          ? state.currentUser.id
          : gift.reservedBy === state.currentUser.id
          ? undefined
          : gift.reservedBy
    })
  }


  const initialState = {
    users: [
      {
        id: 1,
        name: "Test user"
      },
      {
        id: 2,
        name: "Someone else"
      },
      {
        id: 3,
        name: "Bananarama"
      }
    ],
    currentUser: {
      id: 1,
      name: "Test user"
    },
    gifts: [
      {
        id: "immer_license",
        description: "Immer license",
        image: "https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png",
        reservedBy: 2
      },
      {
        id: "egghead_subscription",
        description: "Egghead.io subscription",
        image: "https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg",
        reservedBy: undefined
      }
    ]
  };

  export async function getBookDetails(isbn) {
    const response = await fetch(`http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`, {
      mode: "cors"
    })
    const book = (await response.json())["ISBN:" + isbn]
    return book
  }


  // svelte / "useReducer-like" interaction
  import { writable, get } from 'svelte/store';
  export const giftStore = writable(initialState)

  export let giftsRecipe = (draft, action) => {
    switch (action.type) {
      case "ADD_GIFT":
        const { id, description, image } = action
        draft.gifts.push({
          id,
          description,
          image,
          reservedBy: undefined
        })
        break
      case "TOGGLE_RESERVATION":
        const gift = draft.gifts.find(gift => gift.id === action.id)
        gift.reservedBy =
          gift.reservedBy === undefined
            ? draft.currentUser.id
            : gift.reservedBy === draft.currentUser.id
            ? undefined
            : gift.reservedBy
        break
      case "ADD_BOOK":
        const { book } = action
        draft.gifts.push({
          id: book.isbn,
          description: book.title,
          image: book.cover.medium,
          reservedBy: undefined
        })
        break
      case "RESET":
        return initialState
    }
    return draft
  }

  export const giftsReducer = produce(giftsRecipe);
  export const giftsPatchReducer = produceWithPatches(giftsRecipe);


  export const dispppatch = (action) => {
    giftStore.update(draft => {
      const [nextState, patches] = giftsPatchReducer(draft, action)
      console.log('dispppatch:', nextState, patches)
      return nextState
    })
    return get(giftStore)
  }

  export const dispatch = (action) => {
    giftStore.update(draft => {
      return giftsReducer(draft, action)
    })
    return get(giftStore)
  }



  // add a gift on start
  dispppatch({
    type: "ADD_GIFT",
    id: "mug",
    description: "Coffee mug 1",
    image: "https://belusaweb.s3.amazonaws.com/product-images/designlab/12-oz-santos-ceramic-mugs-sm6355-white1555070363.jpg",
    reservedBy: undefined
  });







</script>
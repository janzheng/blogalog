
<!-- 

  mostly from: https://egghead.io/lessons/react-render-immutable-data-using-react

  use this instead: https://github.com/WHenderson/svelte-immer-store?tab=readme-ov-file 

  
 -->

<div class="container mx-auto p-8">
  <h1 class="text-2xl">Immer stuff</h1>

  <div class="gift-list">
    <div class="user">
      <h2 class="text-lg mb-8">Hello, {currentState.currentUser.name}</h2>
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
        {#each currentState.gifts as gift}
          <div class="mb-4">
            <Gift {gift} currentUser={currentState.currentUser} users={currentState.users} {handleReserve}/>
          </div>
        {/each}
      </div>
    </div> 
  </div>
</div>

<script>

  import { produce } from "immer"
  import Gift from "./Gift.svelte"

  function handleReserve (giftId) {
    currentState = toggleReservation(currentState, giftId)
  }

  function handleAdd () {
    const description = prompt("Gift to add")
    if(description) {
      // basic addGift producer
      currentState = addGift(currentState, Date.now().toString(), description, "https://picsum.photos/200?q=" + Math.random());
    }
  }

  function handleReset() {
    currentState = initialState
  }

  const handleAddBook = async () => {
    const isbn = prompt("Enter ISBN number", "0201558025")
    if (isbn) {
      const book = await getBookDetails(isbn)
      currentState = addGift(currentState, book.isbn, book.title, book.cover.medium);
      
    }
  }





  // you can also just put these in an onClick or handleAdd or whatever but I like it more "externalized" like this
  export const addGift = produce((draft, id, description, image) => {
    draft.gifts.push({
      id,
      description,
      image,
      reservedBy: undefined
    })
  })

  export const toggleReservation = produce((draft, giftId) => {
    const gift = draft.gifts.find(gift => gift.id === giftId)
    gift.reservedBy =
      gift.reservedBy === undefined
        ? draft.currentUser.id
        : gift.reservedBy === draft.currentUser.id
        ? undefined
        : gift.reservedBy
  });



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


  console.log(initialState)
  let currentState = addGift(initialState, "mug", "Coffee mug 1", "https://belusaweb.s3.amazonaws.com/product-images/designlab/12-oz-santos-ceramic-mugs-sm6355-white1555070363.jpg");
  // currentState = addGift(currentState, "mug", "Coffee mug 2", "https://belusaweb.s3.amazonaws.com/product-images/designlab/12-oz-santos-ceramic-mugs-sm6355-white1555070363.jpg");
  // currentState = addGift(currentState, "mug", "Coffee mug 3", "https://belusaweb.s3.amazonaws.com/product-images/designlab/12-oz-santos-ceramic-mugs-sm6355-white1555070363.jpg");
  console.log(currentState)




</script>
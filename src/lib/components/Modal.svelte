<!-- https://svelte.dev/repl/514f1335749a4eae9d34ad74dc277f20?version=3.37.0 -->
<script context="module" >
	let onTop   //keeping track of which open modal is on top
	const modals={}  //all modals get registered here for easy future access
	
	// 	returns an object for the modal specified by `id`, which contains the API functions (`open` and `close` )
	export function getModal(id=''){
		return modals[id]
	}
</script>





<script>
  import { fade } from 'svelte/transition';
  import { onDestroy } from 'svelte'
  
  export const classes = "p-6 bg-slate-50 border-2 border-slate-100 rounded-md | min-w-[600px] max-h-[80vh] overflow-auto cursor-auto"
  let topDiv
  let visible=false
  let prevOnTop
  let closeCallback

  export let id=''

  function keyPress(ev){
    //only respond if the current modal is the top one
    if(ev.key=="Escape" && onTop==topDiv) close() //ESC
  }

  /**  API **/
  function open(callback){
    closeCallback=callback
    if(visible) return
    prevOnTop=onTop
    onTop=topDiv
    window.addEventListener("keydown",keyPress)
    
    //this prevents scrolling of the main window on larger screens
    document.body.style.overflow="hidden" 

    visible=true
    //Move the modal in the DOM to be the last child of <BODY> so that it can be on top of everything
    // document.body.appendChild(topDiv)
  }
    
  function close(retVal){
    if(!visible) return
    visible=false
    window.removeEventListener("keydown",keyPress)
    onTop=prevOnTop
    if(onTop==null) document.body.style.overflow=""
    if(closeCallback) closeCallback(retVal)
  }
    
  //expose the API
  modals[id]={open,close}
    
  onDestroy(()=>{
    delete modals[id]
    window.removeEventListener("keydown",keyPress)
  })
	
</script>

{#if visible == true}
  <div clss="Modal" id="topModal" class:visible bind:this={topDiv} on:click|stopPropagation={()=>close()} on:keyup|stopPropagation={()=>close()} transition:fade={{duration: 200}}>
    <div id='modal' class="{classes}" on:click|stopPropagation={()=>{}} on:keyup|stopPropagation={()=>{}}>
      <svg id="close" on:click={()=>close()} on:keyup={()=>close()} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path></svg>
      <div id='modal-content'>
        <slot></slot>
      </div>
    </div>
  </div>
{/if}

<style lang="scss" global>
	#topModal {
		visibility: hidden;
		z-index: 9999;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #4448;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#modal {
		position: relative;
		max-width: calc(80vw - 20px);
		max-height: calc(96vh - 20px);

    .notion-page {
      @apply p-0 m-0 mt-8;
    }
	}

	.visible {
		visibility: visible !important;
	}

	#close {
		position: absolute;
		top:12px;
		right:12px;
		width:24px;
		height:24px;
		cursor: pointer;
		/* fill:#F44; */
		transition: transform 0.3s;
	}	

	#modal-content {
		overflow: auto;
	}
</style>
<!-- 

  Based off of Itemlist
  - more generalized

 -->

<script>
  import { onMount } from 'svelte';
  import { browser, dev } from '$app/environment';
  // import { marked } from 'marked';
  // import { getNotionImageLink } from '$lib/helpers.js'
  import Notion from '@yawnxyz/sveltekit-notion';
  // import Notion from '$lib/components/sveltekit-notion/src/Notion.svelte'
  import { fetchPost } from "$plasmid/utils/fetch-helpers";
  import Modal, {getModal} from '$lib/components/Modal.svelte';
  import GridItemRow from '$lib/components/GridItemRow.svelte';
  import Loader from '$plasmid/components/icons/loader.svelte';
  // import { twi } from "tw-to-css";

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt();
  md.use(markdownItAttrs);

  export let page, id, items=[], settings=null, isLoading=null, isLoadingMore=null, pageBlocks=null, startCursor=null;
  export let itemKey = 'Name';
  export let itemList = [];
  export let pageNumber = 1;


  let tmp = `showContent: true
loaders:
  itemList: true

itemList:
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/64087f58465a02b9fce34a4d_Coinbase.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/64087fa0de89a26d0c550eb0_Outreach.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/6408766e50950b85856aac99_Duelingo.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/64215ec022b667d667c09d79_wealthsimple-min.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/6408766d2fda6969615b5d8a_Confluent.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/6408766d7968d45d4785da9e_Greyhouse.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/64087fb01004c5474e312705_Aurora.svg
  - Name: icon
    Image:
      - url: https://assets-global.website-files.com/6127a84dfe068e153ef20572/64087fbfde89a220f75510b6_Gainsight.svg
      
item:
  class: flex justify-center flex-col p-1

order:
  - Image

schema:
  Image:
    type: image
    classContainer: flex justify-center flex-col
    class: max-h-16

row:
  wrapper:
    style: "background-color: #F6F3EB"
  class: "px-4 py-6"
  container:
    class: "content-notion-wide"

component:
  class: headline
  list:
    container:
      class: grid grid-cols-2 md:grid-cols-4 gap-2
    item:
      class: border-2 border-transparent rounded-md cursor-pointer ease-in-out hover:ease-in-out duration-300 overflow-hidden
  content:
    class: text-center mb-4
  `
  import YAML from 'yaml'

  if(page.Name == 'Grid 1') {
    // settings = YAML.parse(tmp)
    // console.log('gridItems - settings', settings)
  }



  // set styles
  let gridItemsStyles = ""
  if(settings?.items?.settings) {
    // this spreads variables across
    // gridItemsStyles = Object.entries(settings?.items?.settings)
    // .map(([key, value]) => `${key}: ${value}`)
    // .join('; ');
    let _settings = settings?.items?.settings
    if(_settings.marqueeSpeed)
      gridItemsStyles += "; --marquee-speed: " + _settings.marqueeSpeed
  }
    
  if(settings?.itemKey) {
    itemKey = settings.itemKey
    // defaults to "Name" as the main key, but can be re-specified with itemKey
  }
  if(settings?.itemList) {
    itemList = settings.itemList
  }

  // $: if (browser && settings && dev) {
  //   console.log('[dev] Grid settings:', settings)
  // }
   

  async function loadMoreItems() {
    isLoadingMore = true;
    pageNumber++;
    await getItems(id);
    isLoadingMore = false;
  }
  


  const getItems = async (id) => {
    // if(settings.itemList)
    //   return {}

    if(isLoadingMore != true)
      isLoading = true

    let url = `/api/gridItems/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings, pageNumber, startCursor}, fetch)
			if(response.ok) {
        result = await response.json()
			}
		} catch(err) {
      console.error('[getItems/fetchPost] error', err)
    }

    try {
      if(result && result.items) {
        // for pagination w/ Notion
        if(result?.startCursor)
          startCursor = result.startCursor
  
        if(Array.isArray(items)) {
          items = [...items, ...result?.items]
        } else {
          items = [...result?.items]
        }
      }

      isLoading = false

      if(browser && dev)
        console.log('[dev][getItems] Items:', items)

      // items = [items[0]]

      return {
        items: items || null,
      }
    } catch (e) {
      console.error('[getItems/result] — error', e, 'result:', result)
    }

    return {}
	};

  const loadPage = async (id) => {
    let url = `/api/loadPage/`
    let response, result
		try {
      response = await fetchPost(url, {id, settings}, fetch)
			if(response.ok) {
        result = await response.json()
			}
		} catch(err) {
      console.error('[loadPage] error', err)
    }
    pageBlocks = result?.pageBlocks
    console.log('pageBlocks?!', pageBlocks)
    return result?.pageBlocks
	};







  onMount(async () => {
    ({items} = await getItems(id, settings))
  });

  function getOrderedKeys (items, order=settings?.order) {
    const keys = Object.keys(items);
    if(order) {
      return [
        ...order.filter(key => keys.includes(key)), // ordered keys
        ...keys.filter(key => !order.includes(key)) // remaining keys
      ];
    }
    return keys;
  }

  async function handleItemClick (item, e) {
    if(browser && settings.modal) {

      getModal(item.Name).open()

      if(settings.loadNotionPage || settings.modal.loadNotionPage) {
        pageBlocks = null;
        await loadPage(item.id);
      }

    } else if (browser && settings.item?.click || settings.item?.type == 'click') {
      if(e) e.preventDefault();
      if(settings.item?.itemLink) {
        window.location.href = item[settings.item?.itemLink];
      }
    }
  }

</script>












<div class="GridItems"
 style={gridItemsStyles}
>

  {#if page.Content && settings?.showContent}
    <div class="Component-GridItems-Content {settings?.component?.content?.class||''}">
      {@html md.render(page.Content||'')}
    </div>
  {/if}
  
  <!-- {#if settings.loaders.includes('itemList')} -->
    <!-- use a settings.list instead of dynamically loaded db items -->
  {#if itemList && settings?.loaders?.itemList !== false}
    <div class="Component-GridItems-List-Container {settings?.component?.list?.container?.class||' '}">
      {#each itemList as item}
        <div class="Component-GridItems-List-Item {settings?.component?.list?.item?.class||' '}">
          {#each getOrderedKeys(item) as key}
            <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
          {/each}
        </div>
      {/each}
    </div>
  {/if}

  <!-- note: if itemList is on, we need to also set loaders.notion to be true, or the "no items" error will show -->
  {#if (settings?.loaders?.itemList !== true && settings?.loaders?.notion !== false) || (settings?.loaders?.itemList == true && settings?.loaders?.notion == true)}
    {#if (isLoading) || !items}
      <div class="GridItems-loading {settings?.component?.loadingContainer?.class||' '}">
        <div class="GridItems-loading-title h2 title {settings?.component?.loading?.class||' '}" style="padding-top:0"><Loader /> {settings?.loading || "Loading"}</div>
      </div>
    {:else}
      {#if items.length > 0 && settings}
        {#if settings?.items?.type == 'marquee'}
          <div class="GridItem-Marquee | {settings?.component?.marquee?.class}">
            <div class="relative overflow-x-hidden ">
              <div class="animate-marquee inline-block whitespace-nowrap">
                {#each items as item}
                  {#each getOrderedKeys(item) as key}
                    <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
                  {/each}
                {/each}
              </div>
              <div class="absolute top-0 animate-marquee2 inline-block whitespace-nowrap ">
                {#each items as item}
                  {#each getOrderedKeys(item) as key}
                    <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
                  {/each}
                {/each}
              </div>
            </div>
          </div>


        {:else}
          <div class="GridItem-Grid | {settings?.items?.class || settings?.component?.items?.class || 'grid grid-cols-1 md:grid-cols-2 gap-4'}">
            {#each items as item, index}
              <div class="Item | {settings?.item?.class || settings?.component?.item?.class || "p-4"} | {settings?.items?.[index]?.class||settings?.component?.items?.[index]?.class||''} | {(settings?.modal||settings?.component?.modal) || (settings?.item?.click||settings?.component?.item?.click) ? 'cursor-pointer' : ''}"
                on:click={(e)=>handleItemClick(item, e)} 
                on:keyup={(e)=>handleItemClick(item, e)}
                role="button" tabindex=""
                >
                {#if settings.item?.type == 'link'}
                  <a class="GridItem-link" href="{item[settings.item?.itemLink]||item[settings.component?.item?.itemLink]}" target="_blank">
                    {#each getOrderedKeys(item) as key}
                      <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
                    {/each}
                  </a>  
                {:else}
                  {#each getOrderedKeys(item) as key}
                    <GridItemRow {item} {key} {itemKey} schema={settings?.schema} />
                  {/each}
                {/if}
                {#if browser && settings.modal}
                  <Modal id={item[itemKey]}>
                    {#each getOrderedKeys(item, (settings?.modal?.order||settings?.component?.modal?.order)||[]) as key}
                      <GridItemRow {item} {key} {itemKey} schema={settings?.modal?.schema} />
                    {/each}
                    {#if settings.modal.loadNotionPage}
                      {#if pageBlocks}
                        <Notion blocks={pageBlocks} />
                      {:else}
                        Loading content...
                      {/if}
                    {/if}
                  </Modal>
                {/if}
      
              </div>
            {/each}
            {#if startCursor && settings.loader?.loadMore}
              <!-- notion loader feature -->
              <button class="Btn-outline {settings?.component?.loadMore?.class||''}" on:click={loadMoreItems} disabled={isLoadingMore}>
                {#if isLoadingMore}
                  <Loader /> Loading...
                {:else}
                  Load More
                {/if}
              </button>
            {/if}
          </div>
        {/if}

      {:else}
        <!-- <h2 style="padding-top:0">No items found</h2> -->
        <div class="h2 title {settings?.component?.notFound?.class||''}" style="padding-top:0">No items found</div>
      {/if}
    {/if}
  {/if}
</div>
 
 


<style lang="scss" global>
  .itemHover {
    @apply hover:bg-slate-100 rounded-md;
  }

  // this wraps a link around a lot of content; change the link color / hover behavior
  a.GridItem-link {
    @apply hover:no-underline;

    &:hover {
      .Item-Title {
        @apply underline;
      }
    }
    *:not(.Item-Title) {
      @apply text-slate-900 no-underline hover:no-underline;
    }
    .Item-link a {
      @apply text-slate-500 no-underline hover:no-underline;
    }
  }




  // @keyframes marquee {
  //   0% { transform: translateX(0); }
  //   100% { transform: translateX(-100%); }
  // }
  // @keyframes marquee2 {
  //   0% { transform: translateX(100%); }
  //   100% { transform: translateX(0); }
  // }

  // hardware / maybe faster?
  @keyframes marquee {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-100%, 0, 0); }
  }
  @keyframes marquee2 {
    0% { transform: translate3d(100%, 0, 0); }
    100% { transform: translate3d(0, 0, 0); }
  }

  .animate-marquee {
    display: inline-block; 
    white-space: nowrap;
    animation: marquee var(--marquee-speed) linear infinite;
    img {
      max-width: unset;
    }
  }

  .animate-marquee2 {
    animation: marquee2 var(--marquee-speed) linear infinite;
    img {
      max-width: unset;
    }
  }


  .middle-child-shift:nth-child(3n+2) {
    @apply transform -translate-y-5;
  }
</style>
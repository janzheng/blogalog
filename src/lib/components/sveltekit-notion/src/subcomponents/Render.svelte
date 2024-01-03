<!-- <div class="notion-render"> -->
{#if Object.keys(components).includes(block.type)}
  <svelte:component
    this={components[block.type]}
    {api}
    {blocks}
    {block}
    {doExternalRequest}
    {settings}
    {fullPage}
    >
    {#if block.content}
      {#each block.content as subblock}
        {#if search(subblock, blocks)}
          <svelte:self
            {fullPage}
            {blocks}
            {api}
            {doExternalRequest}
            {settings}
            block={search(subblock, blocks)} />
        {/if}
      {/each}
    {/if}
  </svelte:component>
{/if}

<!-- </div> -->
<script>
  import { search } from '../utils.js'
  import Bookmark from '../components/Bookmark.svelte'
  import BulletedList from '../components/BulletedList.svelte'
  import Callout from '../components/Callout.svelte'
  import Code from '../components/Code.svelte'
  import Column from '../components/Column.svelte'
  import ColumnList from '../components/ColumnList.svelte'
  import Divider from '../components/Divider.svelte'
  import Embed from '../components/Embed.svelte'
  import Header from '../components/Header.svelte'
  import Image from '../components/Image.svelte'
  import NumberedList from '../components/NumberedList.svelte'
  import Page from '../components/Page.svelte'
  import Quote from '../components/Quote.svelte'
  import SubHeader from '../components/SubHeader.svelte'
  import SubSubHeader from '../components/SubSubHeader.svelte'
  import Text from '../components/Text.svelte'
  import Toggle from '../components/Toggle.svelte'
  import Video from '../components/Video.svelte'
  import Tweet from '../components/Tweet.svelte'
  import Collection from '../components/Collection.svelte'
  import Todo from '../components/Todo.svelte'
  import SyncedBlock from '../components/SyncedBlock.svelte'
  import Table from '../components/Table.svelte'

  export let block = {};
  export let blocks = [];
  export let settings = null;
  export let fullPage = false;
  export let api = null, doExternalRequest = null;

  // $: console.log('rendering block:', block, block.type)

  const components = {
      bookmark: Bookmark,
      bulleted_list: BulletedList,
      callout: Callout,
      code: Code,
      column: Column,
      column_list: ColumnList,
      divider: Divider,
      embed: Embed,
      pdf: Embed,
      file: Embed,
      header: Header,
      image: Image,
      numbered_list: NumberedList,
      page: Page,
      quote: Quote,
      sub_header: SubHeader,
      sub_sub_header: SubSubHeader,
      text: Text,
      toggle: Toggle,
      video: Video,
      tweet: Tweet,
      collection_view: Collection,
      to_do: Todo,
      transclusion_reference: SyncedBlock,
      transclusion_container: SyncedBlock,
      table: Table,
  };
</script>

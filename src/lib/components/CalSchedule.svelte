

<script> 
  import { marked } from "marked";
  import { browser } from '$app/environment';
  import { niceDateShort } from '$plasmid/utils/date'
  import { PUBLIC_ICAL } from '$env/static/public';
  import ical from 'ical'

  export let events=[], headerClasses="", 
    itemClasses="Card-solid --white mb-4 px-2 py-2", 
    rowClasses="", 
    summaryClasses="text-lg",
    descClasses="",
    dateClasses="text-sm text-gray-500"
  export let summaryTitle, descTitle, dateTitle

  async function getCal() {
    if(browser && window) {
      try {
        let res = await fetch(`https://cf-proxy.yawnxyz.workers.dev/corsproxy/?apiurl=${PUBLIC_ICAL}`)
        
        if(res.ok) {
          let text = await res.text()
          events = ical.parseICS(text);
        }
      } catch(e) {
        console.error('error', e)
      }
    }
  }
  
  getCal()
  
</script>

<div class="{headerClasses}">
  {#each Object.values(events) as event}
    {#if event.start}
      <div class="{itemClasses} Item">
        <div class="Row {rowClasses} {summaryClasses} Summary " data-content={summaryTitle}>{@html event.summary}</div>
        <div class="Row {rowClasses} {descClasses} Description" data-content={descTitle}>{@html marked(event.description||'')}</div>
        <div class="Row {rowClasses} {dateClasses} Date" data-content={dateTitle}>{niceDateShort(event.start?.toISOString())}</div>
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .Row :pre {
    content: attr(data-content);
  }
</style>
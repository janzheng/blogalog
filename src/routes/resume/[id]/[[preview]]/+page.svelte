<script>
  import { page } from '$app/stores'

  import Resume from '$lib/components/Resume.svelte';
  import ResumeCompact from '$lib/components/ResumeCompact.svelte';
  import exampleResume from '$src/data/example-cv.json';

</script>


{#if $page.data?.resume?.meta.template == 'compact'}
  <ResumeCompact 
    resumeJson={$page.data.resume || exampleResume} 
    id={$page.data.id} 
    mode={$page.data.preview}
    isLoading={!$page?.data?.resume} 
  />
{:else}
  <Resume 
    resumeJson={$page.data.resume || exampleResume} 
    id={$page.data.id} 
    mode={$page.data.preview}
    isLoading={!$page?.data?.resume} 
  />
{/if}
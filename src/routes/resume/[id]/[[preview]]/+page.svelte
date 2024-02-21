<script>
  import { page } from '$app/stores'

  import Resume from '$lib/components/Resume.svelte';
  import exampleResume from '$src/data/example-cv.json';
</script>


<Resume 
  resumeJson={$page.data.resume || exampleResume} 
  id={$page.data.id} 
  mode={$page.data.preview}
  isLoading={!$page?.data?.resume} 
  />
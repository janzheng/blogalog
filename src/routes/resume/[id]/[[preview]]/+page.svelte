<script>
  import { page } from '$app/stores'

  import Resume from '$lib/components/Resume.svelte';
  import exampleResume from '$src/data/example-cv.json';

  console.log('page data:', $page.data)
</script>


<Resume 
  resume={$page.data.resume || exampleResume} 
  id={$page.data.id} 
  mode={$page.data.preview}
  isLoading={false} 
  />
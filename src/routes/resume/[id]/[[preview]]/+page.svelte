<script>
  import { page } from '$app/stores'

  import Resume from '$lib/components/Resume.svelte';
  // import resume from '$src/data/jessica-json-resume.json';

  console.log('page data:', $page.data)
</script>


<Resume 
  resume={$page.data.resume} 
  id={$page.data.id} 
  mode={$page.data.preview}
  isLoading={false} 
  />
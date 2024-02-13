<script>
  import Resume from '$lib/components/Resume.svelte';
  import resume from '$src/data/jessica-json-resume.json';

  // console.log('resumeData:', resume)
</script>


<Resume {resume} />
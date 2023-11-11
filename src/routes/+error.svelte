
<script>
  import { page } from '$app/stores';

  let blogPath = $page.data?.pathSegments?.length>1 ? `/${$page.data?.pathSegments[0]}` : "/";

</script>


<div class="_content | content-pad">

  <div class="mb-4 txt-xs">
    Something went wrong
    <!-- {#if $page?.error.message && Object.entries($page?.error.message).length > 0}
      {$page?.error.message || ''}
    {/if} -->
  </div>

  <h1>{$page?.error.message || 'Sorry, something went wrong!'} </h1>
  <p>Please go back <a href="{blogPath}">Home</p>
  <!-- <h1>Error: {$page?.status}</h1> -->


  {#if $page?.error.stack}
    <pre class="bg-gray-100 rounded-md p-4">
      {$page?.error.stack}
    </pre>
  {/if}

</div>
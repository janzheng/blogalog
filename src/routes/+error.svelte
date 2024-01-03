
<script>
  import { page } from '$app/stores';

  let blogPath = $page.data?.pathSegments?.length>1 ? `/${$page.data?.pathSegments[0]}` : "/";

</script>


<div class="_content | content-pad">

  <!-- <div class="mb-4 txt-xs">
    Something went wrong
    {#if $page?.error.message && Object.entries($page?.error.message).length > 0}
      {$page?.error.message || ''}
    {/if}
  </div> -->

  <h1 class="text-2xl">{$page?.error.message || 'Sorry, something went wrong!'} </h1>
  <p class="mt-4">Please go back <a class="underline cursor-pointer text-blue-600 hover:text-blue-400" href="{blogPath}">home to Blogalog.net</p>
  <!-- <h1>Error: {$page?.status}</h1> -->


  {#if $page?.error.stack}
    <pre class="bg-gray-100 rounded-md p-4">
      {$page?.error.stack}
    </pre>
  {/if}

</div>
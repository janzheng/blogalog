
<script>
  import { page } from '$app/stores';
  import SvelteSeo from 'svelte-seo'
  export const twitter = {};

  export let title, description, ogUrl, imgClasses='', classes=''
  let {head, seo} = $page?.data;
</script>

<SvelteSeo
  title={title ? `${head?.title} | ${title}` : head?.title }
  description={description || head?.description}
  keywords={head?.keywords}
  canonical={head?.canonical + ''}
  openGraph={{
      ...seo?.openGraph ,
      url: ogUrl || head?.url + '',
      // type: article ? siteSeoOpenGraphArticle.type : siteSeoOpenGraphBase.type,
      // ...(article ? { article: {...siteSeoOpenGraphArticle.article, ...article} } : null) }}
  }}
  twitter= {twitter ? {...seo?.twitter, ...twitter} : null}
/>

<svelte:head>
	{#if head }
		{#if head?.meta}
			{#each head?.meta as meta}
				<meta 
					charset={meta?.charset}
					data-hid={meta?.hid} 
					name={meta?.name} 
					content={meta?.content} 
					property={meta?.property} 
				>
			{/each}
    {/if}
		{#if head?.links}
			{#each head?.links as link}
				<link data-hid={link?.hid} rel={link?.rel} href={link?.href} crossorigin={link?.crossorigin ? 'crossorigin' : ''}>
			{/each}
		{/if}
	{/if}
</svelte:head>


<div class="HeadSimple Header {classes}">
  <a href="/">
    <img class="{imgClasses}" alt="evergreen 2023 logo" src="/evg23-full-logo.png" width="250px" />
  </a>
</div>
<!-- <h2>Simple head here — test SEO stuff!!!??!!!</h2> -->
<div class="Home">

  <div class="Hero | content-pad | bg-slate-100 | overflow-hidden ">
    <div class="_content-wide | grid grid-cols-3-2">
      <div>
        <h2 class="antialiased pt-4 pb-8">Hey hey,</h2>
        <h2 class="pt-0 leading-12 antialiased ">I’m Jan, a product designer who combines code, user research, and lean startup methods to tackle complex issues and difficult projects.</h2>
      </div>
      <div class="relative">
        <div id="me-container" on:click={handleClick} on:keypress={handleClick}>
          <img alt="me.png" bind:this={image} id="slideImage" src="jan-zheng-pop.png" />
        </div>
      </div>
    </div>

  </div>



  <div class="content-pad _content-wide">

    <div class="my-16">
      <Companies ></Companies>
    </div>

    
    <!-- {@html marked(`Pizza, a culinary masterpiece loved by many, has a rich and fascinating history that dates back centuries. The story begins in ancient times, where early civilizations in the Mediterranean region discovered the joy of baking flatbreads topped with various ingredients. This precursor to modern pizza was a simple creation, but it laid the foundation for what would become a worldwide sensation.

Fast forward to 18th-century Naples, Italy, and we find the birthplace of the pizza as we know it today. It was in this vibrant city that pizza truly began to flourish. Initially, it was a dish enjoyed mainly by the working class, known as the "poor man's meal." Simple and affordable, it quickly gained popularity among the locals, becoming a staple in Neapolitan cuisine.

The turning point in pizza's history came in 1889 when Queen Margherita of Italy visited Naples. Eager to taste the city's most famous dish, she was served a special pizza created in her honor. Made with fresh mozzarella cheese, tomatoes, and basil, it resembled the colors of the Italian flag. The queen adored it, and this iconic creation was named Pizza Margherita, forever leaving its mark on history.

As time went on, Italian immigrants carried the pizza tradition with them as they settled in different parts of the world. In the late 19th and early 20th centuries, pizzerias began to emerge in New York City and other American cities. However, it wasn't until after World War II that pizza truly took off in the United States, thanks to soldiers who had developed a taste for it while stationed in Italy.

Pizza's popularity continued to soar throughout the 20th century, with new variations and toppings constantly being introduced. From classic pepperoni to gourmet combinations like prosciutto and arugula, there seems to be a pizza for every taste and preference. Today, pizza is enjoyed by people of all ages and backgrounds, making it one of the most beloved and versatile dishes around the globe.

In recent years, the world of pizza has seen an explosion of creativity, with innovative styles and techniques pushing the boundaries of traditional recipes. From the deep-dish wonders of Chicago to the thin, crispy slices of New York, pizza has evolved into an art form, delighting taste buds and captivating imaginations.

Pizza has also become a symbol of cultural exchange and fusion. In countries like Japan, India, and Brazil, local ingredients and flavors have been incorporated into the pizza-making process, resulting in unique and exciting culinary experiences. These adaptations have not only expanded the global pizza family but have also showcased the adaptability and universality of this beloved dish.

Beyond its delectable taste, pizza has ingrained itself in popular culture. From movies and TV shows featuring scenes set in pizzerias to pizza-themed merchandise, it has become an iconic symbol of indulgence and communal dining. Countless friendships have been forged over a slice of pizza, making it more than just a meal but a unifying force that brings people together.

So, the next time you savor a warm slice of pizza, take a moment to appreciate the history and cultural significance behind this incredible dish. From its humble beginnings in ancient times to its modern worldwide fame, pizza has truly stood the test of time, forever satisfying our cravings and filling our hearts with joy.
  `)} -->
  </div>

</div>



<!-- <div class="Content-box _content-narrow my-16 mx-auto">
  <LiveNotion blockId={"3934dd0203ae4f96888b835183702c99"} />
</div>  -->

<script>

  import { marked } from 'marked'
	import { onMount } from 'svelte';
  import LiveNotion from '$lib/components/shared/LiveNotion.svelte';
  import Companies from '$lib/components/Companies.svelte';


  let image;

  // onMount(() => {
  //   setTimeout(() => {
  //     image.style.bottom = '0';
  //   }, 100);
  // });

  function handleClick() {
    image.style.bottom = '0';
  }

</script>

 



<style lang="scss" global>
  // Notion Pages 
  #_block-e6bbf137-2947-4a6a-9aee-bdcb448d1339 {
    // h2 block in intro Notion
    padding-top: 0 !important;
  }

  #me-container {
    position: absolute;
    height: 200px;
    width: 200px;
    // overflow: hidden;

    @apply bottom-32 md:-bottom-12;
  }

  #slideImage {
    cursor: pointer;
    position: absolute;
    bottom: -100%;
    transition: bottom .24s ease-out;

    @apply md:hover:-bottom-[80%];

    // &:hover {
    //   bottom: -80%;
    // }
  }

</style>



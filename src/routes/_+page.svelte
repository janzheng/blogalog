
<div class="_content | mt-4">


  <div class="contain">
    <div id='hero-mobile'></div>  
    <div id='hero'>
      <div class='layer-bg layer parallax' data-depth='0.0'></div>
      <div class='layer-1 layer parallax' data-depth='0.10'></div>
      <div class='layer-2 layer parallax' data-depth='0.15'></div>
      <div class='layer-3 layer parallax' data-depth='0.2'></div>
      <div class='layer-overlay layer parallax' data-depth='0.8'></div>
      <div class='layer-4 layer parallax' data-depth='1.00'></div>
    </div>
  </div>
 

  <div class="mt-16 mb-32 py-2 mx-auto">
    <div class="mx-auto">


      <div class="flex">
        <Registration />
      </div>
      <!-- <div class="mb-12">
        <LoginGoto />
      </div> -->


      <div class="Content-box _content-narrow my-16 mx-auto">
        <LiveNotion />
      </div>
      
      <div class="lg:grid grid-cols-2 gap-4">
        <div id="datetime" class="Content-box my-2 block md:grid grid-cols-1-5 gap-4">
          <CalDate str={_content('_caldate')} classes={'shadow-sm shadow-evergreen mb-4'} showInsert={false} styles="width: 10rem; height: 7rem;" />
          <div>
            {@html marked(_content('_datetime')||'')}
            <CalSchedule />
            <CalWrapper />
          </div>
        </div>
        <!-- <div id="location" class="Content-box my-2 ">
          <span class="hidden block md:grid md:grid-cols-1-4 md:grid-cols-2 gap-4 mb-2 mb-4"></span>
          <div>{@html marked(_content('_location'))}</div>
        </div> -->
  
        <div id="fee" class="Content-box my-2 FeeTable">
          <span class="hidden italic text-sm pfix my-2 serif mb-2"></span>
          <div>{@html marked(_content('_fee'||'')||'')}</div>
        </div>

        <!-- <div id="abstract" class="Content-box my-2 ">
          <div>{@html marked(_content('_abstract'))}</div>
        </div> -->
      </div>


    </div>
  </div>

  <Sponsors />

</div>
<Footer />


<script>

	import { onMount } from 'svelte';
  import { marked } from "marked";
  import { _content } from '$plasmid/modules/content/store.js'

  import gsap from 'gsap/dist/gsap';
  import ScrollTrigger from 'gsap/dist/ScrollTrigger';

  import CalDate from '$plasmid/components/CalDate.svelte';
  import LiveNotion from '$lib/components/shared/LiveNotion.svelte';

  import CalSchedule from '$lib/components/CalSchedule.svelte';
  import CalWrapper from '$lib/components/CalWrapper.svelte';
  // import Registration from '$lib/components/RegistrationPrototype.svelte';
  import Registration from '$lib/components/EmailRegistration.svelte';
  import Sponsors from '$lib/components/Sponsors.svelte';
  // import LoginGoto from '$lib/components/LoginGoto.svelte';
	import Footer from '$lib/layouts/Footer.svelte'

	onMount(async () => {
    gsap.registerPlugin(ScrollTrigger);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.utils.toArray(".parallax").forEach(layer => {
      const depth = layer.dataset.depth;
      const movement = -(layer.offsetHeight * depth) / 2.2 // this factor controls scroll amount
      tl.to(layer, {y: movement, ease: "none"}, 0)
    });
	});


</script>

 



<style lang="scss" global>

  // for prices 
  .FeeTable {
    table {
      @apply table-auto border-separate border-spacing-2 border rounded-lg border-evg-active-green/20 w-full;
    }
  }


  // Notion Pages 
  #_block-e6bbf137-2947-4a6a-9aee-bdcb448d1339 {
    // h2 block in intro Notion
    padding-top: 0 !important;
  }




  // parallax

  $containerHeight: 400px;
  $heroHeight: 400px;

  .contain {
    max-height: $containerHeight;
    max-width: 100%;
    overflow: hidden;
    border-radius: 16px;
  }

  #hero {
    height: $heroHeight;
    overflow: hidden;
    position: relative;
    max-width: 100%;
    margin: 0 auto;
  }
  .layer {
    background-position: bottom center;
    background-size: auto;
    background-repeat: no-repeat;
    width: 100%;
    height: $heroHeight;
    position: absolute;
    z-index: -1;
  }

  #hero, .layer {
    min-height: $heroHeight;
  }

  #hero-mobile {
    display: none;
    background: url("/images/evg23_card_mobile_dates.jpg") no-repeat center / contain;
    // background: url("/images/evg23_mobile_site_bg.jpg") no-repeat center bottom / cover;
    height: 480px;
    border-radius: 32px;
    
    // @apply h-48 bg-cover bg-center bg-no-repeat rounded-sm;
    // @apply sm:h-[480px] rounded-xl;
  }

  .layer-bg {
    background-image: url('/images/evg23-0-bg.svg');
  }


  // parallax from here: https://codepen.io/GreenSock/pen/OJyPmgX 
  .layer-1 {
    // background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/272781/ilu_man.png');
    background-image: url('/images/evg23-1-phage-mtn.svg');
    background-position: center bottom;
    background-size: 50%;
    // margin-top:100px;
    bottom: -40px;
  }
  .layer-2 {
    background-image: url('/images/evg23-2-wave2.svg');
    background-position: center bottom;
    background-size: 100% 50%;
    bottom: -70px;
  }
  .layer-3 {
    background-image: url('/images/evg23-3-pinegroups.svg');
    background-position: center bottom;
    background-size: 100% 100%;
    bottom: -140px;
    opacity: 0.6;
  }
  .layer-overlay {
    background-image: url('/images/evg23-5-logo-2.svg');
    background-position: center;
    background-size: 30%;
    bottom: -30px;
  }
  .layer-4 {
    background-image: url('/images/evg23-4-ecoli.svg');
    background-position: 100px 100px;
    background-size: 12%;
    // bottom: -40px;
  }

  // small screens
  // media from 0 to 768
  @media screen and (max-width: 768px) {
    #hero {
      display: none;
    }
    #hero-mobile {
      display: block;
    }
  }
  @media screen and (min-width: 1280px) {
    .layer-1 {
      background-size: 45%;
      bottom: -20px;
    }
    .layer-2 {
      background-size: 100% 60%;
    }
    .layer-3 {
      background-size: 100% 120%;
    }
    .layer-overlay {
      bottom: -10px;
    }
    .layer-4 {
      background-size: 15%;
    }
  }
  @media screen and (min-width: 1440px) {
    .layer-1 {
      background-size: 45%;
      bottom: -50px;
    }
  }



  


</style>



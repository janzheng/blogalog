<script>

  import { throttle } from 'lodash';
  import { dev, browser } from '$app/environment';
  import { onMount, onDestroy } from 'svelte';

  import { gsap, Linear } from 'gsap';
  import { ScrollMagicPluginGsap } from 'scrollmagic-plugin-gsap';

  // import ScrollMagic from 'scrollmagic'; // Assuming you have ScrollMagic installed as a dependency

  let ScrollMagic;


  const starters = [
    "(they’re our specialty!)",
    "Be the reason someone smiles today",
    "Live life to the MAXillary",
    "Always read the plaque",
    "Increase your Face Value",
    "We do it twice a day",
    "Floss like a boss",
    "Brace yourself for a good time",
    "Molar, molar on the wall",
    "You know the drill",
    "Don't forget to brush up on your skills",
    "Cavity search in progress",
    "Filling fine and dandy",
    "Tooth be told, we're the best",
    "Rooting for your smile",
    "Crown me the king of clean teeth",
    "We've got the wisdom (teeth) you need",
    "Gums all folks!",
    "Plaque to the future",
    "Grin and bear it",
    "Dental flossophy 101",
    "Bicuspid your fears goodbye"
  ]

  const jokes = [
    ["Why did the doughnut go to the dentist?",
    "Because he needed a filling!"],
    ["How are false teeth like stars?",
    "They only come out at night!"],
    ["Why did the king go to the dentist?",
    "To get his teeth crowned!"],
    ["What do you call a dentist who doesn't like tea?",
    "Denis!"],
    ["What is a dentist's office??",
    "A filling station!"],
    ["At what time do most people go to the dentist?",
    "At Tooth-Hurty!"],
    ["What did the dentist see at the North Pole??",
    "A molar bear!"],
    ["What does a dentist do on a roller coaster??",
    "He braces himself!"],
    ["Why did the computer go to the dentist?",
    "Because it had bluetooth!"],
    ["What do you call a contemplative dentist?",
    "A flossofer!"],
    ["Why did the lawyer go to the dentist?",
    "Because he couldn’t handle the tooth!"],
    ["What is the best kind of filling?",
    "Chocolate!"],
    ["What was the dentist’s prior job?",
    "Drill sergeant!"],
    ["Why did the dentist meditate?",
    "To get a transcend dental experience!"],
    ["Why did the beaver go to the dentist?",
    "To get a dental dam!"],
    ["What does the tooth say to the departing dentist?", 
    "Fill me in when you get back!"],
    ["Why was the toothbrush sad?", 
    "It lost its paste!"],
    ["What do dentists call X-rays?", 
    "Tooth pics!"],
    ["Why did the deer need braces?", 
    "Because it had buck teeth!"],
    ["What do you call a dentist’s advice?", 
    "His flossophy!"],
    ["Why did the dentist become a gardener?", 
    "He had a green tooth!"],
    ["What’s a dentist’s favorite instrument?", 
    "The tuba toothpaste!"],
    ["Why did the smartphone go to the dentist?", 
    "It had a Bluetooth problem!"],
    ["What did the dentist say to the computer?", 
    "This won't hurt a byte!"],
    ["Why do dentists like potatoes?", 
    "Because they are so filling!"],
    ["What’s a dentist's favorite dinosaur?", 
    "A Flossoraptor!"],
    ["Why was the dentist a good detective?", 
    "He could get to the root of the problem!"],
    ["What do you call a bear with no teeth?", 
    "A gummy bear!"],
    ["Why did the toothbrush get an award?", 
    "It was outstanding in its field (of plaque)!"]
  ]

  export let jokeText = '', jokeIndex = -1, getAnswer = false;
  jokeText = starters[Math.floor(Math.random() * starters.length)] || 'banana';

  function getJoke() {
    console.log('...getting joke...')
    if (!getAnswer) {
      // create new joke
      let oldJoke = jokeIndex
      while (oldJoke == jokeIndex) { // get a unique joke
        jokeIndex = Math.floor(Math.random() * jokes.length)
      }
      getAnswer = true;
      jokeText = jokes[jokeIndex][0]; // random joke
    } else {
      // create answer
      getAnswer = false;
      jokeText = jokes[jokeIndex][1];
    }
  }


  
  if (browser) { 
    
    let teethFieldController;
    let teethRainController;
    let teethFieldScenes = [];
    let teethRainScenes = [];
    let teethScene1, teethScene2;
  
    onMount(async () => {

      if (typeof window !== 'undefined' && !ScrollMagic) {
        const module = await import('scrollmagic');
        ScrollMagic = module.default || module;
        // Initialize your ScrollMagic code here
        ScrollMagicPluginGsap(ScrollMagic, gsap);
      }
      
      window.addEventListener('resize', throttledResize); // Add event listener for resize

      teethFieldController = new ScrollMagic.Controller();
      teethRainController = new ScrollMagic.Controller();
  
      // Call your functions here
      // generateTeethField();
      // generateTeethRain();
  
      // Add event listener for resize
      window.addEventListener('resize', resize);
      regen();



    });
  
    onDestroy(() => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', throttledResize); // Clean up event listener
    });
  
    // Your functions go here, converted to vanilla JS
    function generateTeethField() {
      // Get the tooth element
      const _tooth = document.querySelector('._tooth');
      // Garbage collect at start
      document.querySelectorAll('._teethField-item').forEach(el => el.remove());
      if(teethScene1) teethScene1.destroy();
      if(teethScene2) teethScene2.destroy();
  
      let vGap = 54, cGap = 36;
      const windowWidth = window.innerWidth;
      const scale = 0.3;
      let z = -1;

      // Calculate the width of each tooth, including the gap
      const toothWidth = _tooth.offsetWidth * scale + cGap;

      // Get the container element
      const container = document.querySelector('.Teeth-wrapper');

      // Get the width of the container
      const containerWidth = container.getBoundingClientRect().width;

      // Calculate the number of teeth that can fit in the window's width
      // let fieldCols = Math.floor(windowWidth / toothWidth);
      let fieldCols = Math.floor(containerWidth / toothWidth);
      let fieldRows = 4; // 35;


      for(let c=0; c<fieldCols; c++) {
        let left = c * toothWidth;

        for(let r=0; r<fieldRows; r++) {
          let obj = _tooth.cloneNode(true);
          obj.classList.remove('_tooth');
          obj.classList.add('_teethField-item');
          let rotation = z;
          obj.style.left = `${left}px`;
          // obj.style.top = `${r * (_tooth.offsetHeight * scale + vGap)}px`;
          obj.style.top = `${r * (scale + vGap)}px`;
          obj.style.transform = `rotate(${rotation}deg) scale(${scale})`;

          let colName = 'teethCol-' + (z+2);
          obj.classList.add(colName);
          obj.id = 'teethField-'+c+'-'+r;
          document.querySelector('._teeth-field').appendChild(obj);
          z = z * -1;
        }
        z = z * -1;
      }
  
      if(!teethScene1) {
        teethScene1 = new ScrollMagic.Scene({triggerElement: '.teethCol-1', duration: window.innerHeight + 600, offset: -0 - (_tooth.offsetWidth * scale + cGap)})
          .setTween('.teethCol-1 *', {rotation: -80, opacity: 0.8})
          .addTo(teethFieldController);
          
        teethScene2 = new ScrollMagic.Scene({triggerElement: '.teethCol-3', duration: window.innerHeight + 600, offset: -0 - (_tooth.offsetWidth * scale + cGap)})
          .setTween('.teethCol-3 *', {rotation: 180, opacity: 0.7})
          .addTo(teethFieldController);

        teethFieldScenes.push(teethScene1);
        teethFieldScenes.push(teethScene2);
      }

    }
  
  
    function generateTeethRain() {
      // Reset the scenes and dom
      if(teethRainScenes.length > 0) {
        teethRainScenes.forEach(function(s) {
          s.destroy();
        })
        document.querySelectorAll('._teethRain').forEach(el => el.remove());
        teethRainScenes = []
      }
  
      const windowWidth = window.innerWidth;
      // Get the container element
      const container = document.querySelector('.Teeth-wrapper');

      // Get the width of the container
      const containerWidth = container.getBoundingClientRect().width;

      let toothCount = 0, teeth = [];
      const _tooth = document.querySelector('._tooth'); // the tooth to clone
      const boundX_min = 40, 
            boundX_max = containerWidth - 100,
            boundY_min = document.querySelector('.ContentBody').offsetTop, 
            boundY_max = document.body.offsetHeight - document.querySelector('.footer').offsetHeight;
  
      if (windowWidth > 992) {
        toothCount = 28;
      } else {
        toothCount = 12;
      }
  
      // construct teeth objects
      for(let i=0; i<toothCount; i++) {
        let tooth = {
          left: Math.random() * (boundX_max - boundX_min) + boundX_min,
          top: Math.random() * (boundY_max - boundY_min) + boundY_min,
          rotY: Math.random() * (360 - 120) + 120,
          opacity: Math.random() * 0.16 + 0.008,
          scroll_rot: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * (360 - 120) + 120),
          scroll_y: Math.abs(Math.exp(Math.random()) - Math.random()) * 1200
        }
        teeth.push(tooth);
  
        // create dom objects
        let obj = _tooth.cloneNode(true);
        obj.classList.remove('_tooth');
        obj.classList.add('_teethRain');
        obj.style.left = `${tooth.left}px`;
        obj.style.top = `${tooth.top}px`;
        // obj.style.transform = `rotateY(${tooth.rotY}deg)`;
        obj.style.opacity = tooth.opacity;
        obj.id = 'tooth-'+i;
        document.querySelector('._teeth-rain').appendChild(obj);
  
        teethRainController.update();
  
        var teethRainScene = new ScrollMagic.Scene({triggerElement: '#' + obj.id, duration: 3500, triggerHook: 'onEnter', offset: 0})
          // .setTween( '#' + obj.id + ' *', {rotation: tooth.scroll_rot, y: -tooth.scroll_y, ease: Linear.easeNone})
          .setTween( '#' + obj.id + ' *', {rotation: tooth.scroll_rot, y: -tooth.scroll_y, ease: Linear.easeNone})
          .addTo(teethRainController); 
  
        teethRainScenes.push(teethRainScene);
      }
    }
      
    let windowWidth = window.innerWidth;
  
    function resize() {
      if(window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        regen();
      }
    }
  
  
    function regen() {
      // if(!isMobile) {
        // $('.js-test').append('<div>Regen:'+_width+'</div>')
        generateTeethRain();
        generateTeethField();
      // }
    }
    let throttledResize = throttle(resize, 2000);
  
  }

</script>




<div class="Teeth-wrapper | relative h-48">
  <div class="_tooth" style="position: absolute">
    <img class="_tooth-img" alt="tooth" src="https://f2.phage.directory/blogalog/tooth.png" />
  </div>
  <!-- <div class="custom teeth"> -->
    <!-- <div class="_teeth-field"></div> -->
    <!-- <div class="teeth-collection"></div> -->
  <!-- </div> -->
  <div class="_teeth-rain"></div>
  
  
  <div class="hero">
    <div class="bg-teeth">
      <div class="_teeth-field"></div>

      <button class="hero-text-container | relative z-50 pointer-cursor block mx-auto p-8 flex flex-col gap-1 items-center" on:click={()=>{getJoke()}} >
        <div class="BigJohn">WE LOVE TEETH.</div>
        <h4 class="joker">{jokeText}</h4>
      </button>
    </div>
  </div>

</div>



<style lang="scss" global>


@font-face {
  font-family: 'Big John';
  src: url('https://f2.phage.directory/blogalog/BigJohn.eot');
  src: url('https://f2.phage.directory/blogalog/BigJohn.eot?#iefix') format('embedded-opentype'),
    url('https://f2.phage.directory/blogalog/BigJohn.woff') format('woff'),
    url('https://f2.phage.directory/blogalog/BigJohn.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.BigJohn {
  font-size: 72px;
  line-height: 95px;
    
  font-family: 'Big John', sans-serif;
  color: white;
  letter-spacing: 1.6px;
  -webkit-text-stroke: 3px #264068;
  text-stroke: 1px #264068;
  color: white;

  text-shadow: -3px 3px 0 rgba(173, 165, 162, 0.8), -1px -1px 0 rgba(173, 165, 162, 0.8), 1px -1px 0 rgba(173, 165, 162, 0.8), -1px 1px 0 rgba(173, 165, 162, 0.8), 1px 1px 0 rgba(173, 165, 162, 0.8);
}



.hero {
  // height: 450px;
  // background: pink;

  // @include screen-xs {
  //   height: 400px;
  // }

  & > div {
    // grid-template-rows: 450px; // 7 rows of teeth
    grid-template-rows: 350px; // 5 rows of teeth
    justify-items: bottom;
  }


  .hero-text {
    // @extend %max-width; 
    margin: 0 auto;
    border-radius: 12px;
    // @extend %noselect;

    height: 100%;
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 1fr;
    justify-items: center; // middle (left/right)
    align-items: center; // middle (top/down)
    // height: 100%; // sometimes required? maybe when set explicit height?
  
    h1 {
      margin-bottom: 0;
      // @extend %noselect;
    }

    .hero-text-container {
      display: block;
      padding: 2rem;

    //   @include screen-sm {
    //     background: rgba($color-white, 0.8);
    //     padding-left: $base/2;
    //     padding-right: $base/2;
    //   }
    }
  }

  // @include screen-xs {
  //   .joker {
  //     text-align: left !important;
  //   }
  // }
  // fun
  .hero-text-container {
    cursor: pointer;
  }
  .joker {
    // @extend %noselect;
    cursor: pointer;
    &.joke {
      cursor: help;
    }
  }

}




  // teeth

  html {
    // helps position these absolutely
    position: relative;
  }

  .teeth-collection {

  }
  
  // used by js as the real "tooth"
  ._tooth, ._teethRain, ._teethField-item {
    padding: 0 !important;
    position: relative;
    left: -99999px;
    // z-index: -99999;
  }

  ._tooth, ._teethRain {
    width: 100px;
    z-index: 0; // not too hidden, but it does end up blocking links lol
  }
  ._teeth-rain {
    position: absolute;
  }

  ._teethField-item {
    transform-origin: center;
    // position: absolute;
    display: inline;
    width: 120px; // w/o this they end up getting smaller @ end ofthe column for some reason
  }
  ._teeth-field {
    opacity: 0.2;
    position: relative;
    // left: -40px;
    top: -40px;
  }
  //   // tooth obj in the field
  //   ._teethField-item img {
  //     opacity: 0.01;
  //   }


  ._tooth-container {
    padding: 0 !important;
  }
  ._tooth-tr {
    padding: 0 !important;
  }








  .tooth-1 {
    opacity: 0.05;
    left: 10px;
    top: 2140px;
  }

  .tooth-2 {
    opacity: 0.037;
    left: 360px;
    top: 1300px;
    transform: rotateY(170);
  }

  .tooth-3 {
    opacity: 0.037;
    left: 410px;
    top: 2650px;
    transform: rotateY(-90);
  }

  .tooth-4 {    
    opacity: 0.11;
    right: 180px;
    top: 2300px;
    transform: rotateY(120);
  }

</style>
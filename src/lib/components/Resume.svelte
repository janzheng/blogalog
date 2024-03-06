

<script>
  import { PUBLIC_SHEET_URL } from '$env/static/public';

  import { page } from '$app/stores';
  import { onMount, tick } from 'svelte';
  import Icon from '@iconify/svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'

  import { JSONEditor } from 'svelte-jsoneditor'

  let message;
  export let mode; //  = 'preview';
  export let state = 'split'; // 'view', 'json'
  // export let state = 'view'; // 'view', 'json'

  import MarkdownIt from 'markdown-it';
  import markdownItAttrs from 'markdown-it-attrs';
  const md = new MarkdownIt({ breaks: true, html: true, linkify: true });
  md.use(markdownItAttrs);

  export let resumeJson = {};
  import { writable, derived } from 'svelte/store'

  export let id = $page.url.searchParams.get('id');

  import sheet, { Sheet } from '@yawnxyz/sheetlog';
  import { persisted } from 'svelte-persisted-store'
  export let savedResumeText = persisted(`resumeText-${id}`, '');
  export let resumeText = writable('');
  let resumeTextWrapper = derived(resumeText, store => ({text: store}));
  let socialEmail="", socialText="";
  
  export let isLoading = true, hasUnsaved = false;
  
  // import { nanoid } from 'nanoid'

  sheet.setup({ 
    sheetUrl: PUBLIC_SHEET_URL,
    sheet: "Resumes"
  });

  // grabbable handles
  let startX, startWidth;
  let panelWidth = 700; // Initial width of the panel


  function handleSaveShortcut(event) {
    if (event.metaKey && event.key === 's') {
      event.preventDefault(); // Prevent the default browser save action
      saveResume();
    }
  }


  onMount(async () => {
    window.addEventListener('keydown', handleSaveShortcut);
    
    panelWidth = window.innerWidth / 2; // Set to half of the window width
    isLoading = true;

    if($savedResumeText) {
      $resumeText = $savedResumeText
      try {
        resumeJson = JSON.parse($resumeText)
      } catch(e) {}
      isLoading = false;
      return
    }

    // if id is given, we try to load it from the src instead of just memory
    if(id) {
      try {
        let result = await sheet.find("Id", id);
        if(result && result.data?.Resume) {
          resumeJson = JSON.parse(result.data?.Resume)
          $resumeText = JSON.stringify(resumeJson, null, 2)
          console.log('[loaded resume]:', resumeJson)
        }
      } catch(e) {
        console.error('[resume] error / not loaded', e, resumeJson)
      }
    }

    isLoading = false;
    return () => {
      window.removeEventListener('keydown', handleSaveShortcut);
    };
  });

  $: if($resumeText) {
    try {
      resumeJson = JSON.parse($resumeText)
      socialEmail = resumeJson.basics?.email;
      socialText = resumeJson.basics?.profiles.map(p => p.url + '\n').join('');
    } catch(e) {
      console.error('[resumeText] error:', e, $resumeText)
    }
  }




  // Accessing a URL parameter named 'preview' to edit the page
  let preview = $page.url.searchParams.get('preview');
  if(preview === 'true') {
    mode = 'preview'
  }

  
  // content / json change
  function handleChange(updatedContent, previousContent, { contentErrors, patchResult }) {
    console.log('[handleChange]: ', { updatedContent, previousContent, contentErrors, patchResult })

    $resumeText = updatedContent.text || JSON.stringify(updatedContent.json, null, 2);
    resumeJson = JSON.parse($resumeText);
    hasUnsaved = true;
    message = "unsaved changes";
    socialEmail = resumeJson.basics?.email;
    socialText = resumeJson.basics?.profiles.map(p => p.url + '\n').join('');
  }




  function initDrag(e) {
    startX = e.clientX;
    startWidth = panelWidth;
    document.addEventListener('mousemove', doDrag, false);
    document.addEventListener('mouseup', stopDrag, false);
  }

  function doDrag(e) {
    const newWidth = startWidth + e.clientX - startX;
    panelWidth = newWidth > 0 ? newWidth : 0; // Prevent negative width
  }

  function stopDrag() {
    document.removeEventListener('mousemove', doDrag, false);
    document.removeEventListener('mouseup', stopDrag, false);
  }



  async function saveResume() {
    try {
      if(!id) {
        message = "Please enter an id!"
        console.error(message)
        return; 
      }
      message = "saving"
  
      let saveObj = { Id: id, Resume: $resumeText}
      $savedResumeText = $resumeText
  
      let results = await sheet.update(saveObj, {
        "id": id,
        "idColumn": "Id",
      });
  
      // could fetch + diff, but would take up an action (and be slower)
      // SOMETIMES GOOGLE SHEETS DOESN'T SEEM TO SAVE? (or update the sheets interface?)
      console.log('saveResume:', saveObj, 'results', results)
      message = "saved!"
      hasUnsaved = false // super naive impl

    } catch(e) {
      console.error('error saving resume', e)
    }
  }

  let resumeOrder = [
    'about',
    'work',
    'education',
    'publications',
    'certificates',
    'awards',
    'talks',
    'writings',
    'media',
    'interests',
    'skills',
    'roles',
    'volunteer',
    'languages',
    'projects',
    'references'
  ];




</script>


<svelte:head>
  <!-- <title>{`${resumeJson?.basics?.name} | biosketch` || 'Resume not found!'}</title> -->
  <!-- <title>{`${resumeJson?.basics?.name} | ${id}` || 'Resume not found!'}</title> -->
  <title>{`${id}` || 'Resume not found!'}</title>
</svelte:head>

<div class='Resume'>
  {#if isLoading}
    <div class="text-center h-screen w-screen flex flex-row items-center justify-center | text-3xl text-slate-300 serif">
      Loading Resume...
    </div>
  {:else}

    {#if mode=='preview'}
      <div class="preview-controls | my-1 mx-1 || print:hidden">
        <div class="preview-mode | flex gap-0 | text-sm justify-center items-baseline">
          <button class="button | {state == 'json' ? 'active' : ''} border-l-2 border-y-2 rounded-s-xl" on:click="{() => state = 'json'}">JSON</button>
          <button class="button | {state == 'split' ? 'active' : ''} border-y-2" on:click="{() => state = 'split'}">Split</button>
          <button class="button | {state == 'view' ? 'active' : ''} border-r-2 border-y-2 rounded-e-xl" on:click="{() => state = 'view'}">View</button>
          <div class="flex items-center | ml-4">
            <input type="text" class="px-2 py-1 my-0" bind:value={id} />
            <button class="Btn-text | -ml-16" on:click={() => saveResume()}>Save</button>
            {#if message}
              <span class="text-slate-500">{message}</span>
            {/if}
          </div>
          <button class="Btn-text | ml-4" on:click="{() => window.print()}">Print</button> 
          <div class="text-xs text-slate-500">for best print results, use settings: "margins: minimum" with no headers/footers</div>
        </div>
      </div>
    {/if}

    <div class="flex gap-4 px-4">
      {#if mode == 'preview' && (state == 'json' || state == 'split')}
        <div class="view-json | h-screen sticky top-0 || print:hidden " 
          style={`width: ${state=='split' && (panelWidth+"px") || '100%'};`}
          >
          <!-- {#if resumeJson.json} -->
            <JSONEditor content={$resumeTextWrapper} mode="text" onChange="{handleChange}" />
          <!-- {/if} -->
        </div>
        <div class="handlebar {state!=='split' && 'hidden'}" on:mousedown={initDrag} role="button" tabindex="0"></div>
      {/if}
      
      {#if mode != 'preview' || (mode == 'preview' && (state == 'view' || state == 'split'))}
        <div class="view-resume flex-1" >
          {#if resumeJson}
            <div class="resume | container mx-auto p-4 | {resumeJson?.meta?.classes}" >
          
              <!-- basic profile information -->
              <div class="basics | ">
                <!-- <div class="grid grid-cols-1-4 gap-2"> -->
                <div class="sm:flex gap-4">
                  <div class="">
                    {#if resumeJson.basics?.image}
                      <img src={resumeJson.basics?.image} alt="{resumeJson.basics?.name}" class="rounded-full min-w-24 w-24 h-24 md:min-w-32 md:w-32 md:h-32 mb-4 object-cover" />
                    {/if}
                  </div>
                  <div class="flex flex-col flex-1">
                    <div class="flex flex-col flex-1">
                      <h1 class="text-xl font-medium pb-1">
                        {resumeJson.basics?.name}{resumeJson.basics?.title ? `, ${resumeJson.basics.title}` : ''}
                      </h1>
                    </div>
                    <div class="basics-summary mb-2">{resumeJson.basics?.summary}</div>
          
                    <div class="basics-primary text-sm text-slate-500">
                      <p class="">{resumeJson.basics?.label}</p>
                      <p class="text-sm">
                        {#if resumeJson.basics?.location?.address}{resumeJson.basics.location.address}{#if resumeJson.basics.location.city || resumeJson.basics.location.region || resumeJson.basics.location.countryCode}, {/if}{/if}
                        {#if resumeJson.basics?.location?.city}{resumeJson.basics.location.city}{#if resumeJson.basics.location.region || resumeJson.basics.location.countryCode}, {/if}{/if}
                        {#if resumeJson.basics?.location?.region}{resumeJson.basics.location.region}{#if resumeJson.basics.location.countryCode}, {/if}{/if}
                        {resumeJson.basics?.location?.countryCode||''}
                      </p>
                    </div>
                    <div class="basics-secondary text-sm mt-4">
                      <!-- <a href="mailto:{resume.basics?.email}" class="text-blue-500 hover:text-blue-700">{resume.basics?.email}</a> -->
                      <!-- <div class="flex mt-4">
                        {#each resume.basics?.profiles as profile}
                          <a href={profile.url} class="mx-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors duration-300">
                            {profile.network}
                          </a>
                        {/each}
                      </div>  -->
                      {#if socialEmail || socialText}
                        <div class="socialbox mb-2 ">
                          <SocialBox classes="block" showFullLinks={true} iconClass="text-xl" linkClass="flex items-center mb-2 hover:text-blue-700 hover:underline" email={socialEmail} socialText={socialText}  />
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              </div>
          
              {#each resumeJson.meta?.order || resumeOrder as key}
                {#if key=='about' && resumeJson.basics?.about}
                  <div class="section about">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name ===key)?.label || "About"}
                    </div>
                    {#if resumeJson.basics?.about}
                      <!-- <p class="text-sm">{resumeJson.basics?.about}</p> -->
                      <div class="mdpara text-sm">{@html md.render(resumeJson.basics?.about||'')}</div>
                    {/if}
                  </div>
                  {#if resumeJson.basics?.notes}
                    <div class="mt-2 notes">
                      <!-- don't show header for notes -->
                      <!-- <div class="title">
                        Notes
                      </div> -->
                      <ul>
                        {#each resumeJson.basics?.notes as note (note)}
                          <li class="text-sm">{note}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                {/if}

                <!-- work -->
                {#if key=='work' && resumeJson[key]}
                  <div class="section work">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Work Experience"}
                    </div>
                    <div class="items">
                      {#each resumeJson.work as work}
                        <div class="item work-item | mb-4 | flex gap-2">
                          <div class="work-logo left | flex flex-col justify-center items-center">
                            {#if work.image}
                              <div class="w-16 h-16">
                                <!-- div wrapper forces width -->
                                <img src="{work.image}" alt="{work.name}" class="work-image w-16 h-16 object-contain">
                              </div>
                            {:else}
                              <div class="w-12 h-12 mt-1 flex justify-center items-center">
                                <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                                <Icon class="w-8 h-8 text-slate-400" icon="solar:buildings-outline" />
                                <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                              </div>
                              <!-- <div class="w-2 h-2 m-7 mt-2 bg-slate-200 rounded-full"></div> -->
                            {/if}
                            <div class="border-l-2 border-slate-100 flex-1"></div>
                          </div>
                          <div class="work-details right | text-sm | {work.image && ''}">
                            <div class="work-primary">
                              {#if work.name}<div class="name sub-title font-medium">{work.name}</div>{/if}
                              {#if work.position}<div class="position">{work.position}</div>{/if}
                            </div>
                            <div class="work-secondary | text-slate-500 antialiased">
                              {#if work.startDate}<span class="dates">{work.startDate} - {work.endDate ? work.endDate : 'present'}</span>{/if}{#if work.location}&nbsp;· <span class="location">{work.location}</span>{/if}
                            </div>
                            <div class="work-body | mt-2">
                              {#if work.description}<div class="description">{work.description}</div>{/if}
                              {#if work.highlights && work.highlights.length}
                                <div class="highlights | mt-1">
                                  <ul>
                                    {#each work.highlights as highlight}
                                      <li>{highlight}</li>
                                    {/each}
                                  </ul>
                                </div>
                              {/if}
                              {#if work.media && work.media.length}
                                <ul class="media">
                                  <!-- <div class="text-sm text-slate-400">Media</div> -->
                                  {#each work.media as media}
                                    <li class="media-item ">
                                      <div>
                                        {#if media.url}
                                          <a href="{media.url}" target="_blank" rel="noopener noreferrer">
                                            <span class="">{media.title} - {media.date} ({media.platform})</span>
                                          </a>
                                        {:else}
                                          <div class="">{media.title} - {media.date} ({media.platform})</div>
                                        {/if}
                                        <div class="summary">{media.summary}</div>
                                      </div>
                                    </li>
                                  {/each}
                                </ul>
                              {/if}
                              
                            </div>  
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- education -->
                {#if key=='education' && resumeJson[key]}
                  <div class="section education">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Education"}
                    </div>
                    <div class="items">
                      {#each resumeJson.education as education}
                        <div class="item education-item | mb-4 | flex gap-2">
            
                          <div class="left | flex flex-col justify-center items-center">
                            {#if resumeJson.image}
                              <div class="w-16 h-16">
                                <!-- div wrapper forces width -->
                                <img src="{resumeJson.image}" alt="{resumeJson.name}" class="work-image w-16 h-16 object-contain">
                              </div>  
                            {:else}
                              <div class="w-12 h-12 m-2 mt-1 flex justify-center items-center">
                                <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                                <Icon class="w-8 h-8 text-slate-400" icon="solar:square-academic-cap-outline" />
                                <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                              </div>
                              <!-- <div class="w-2 h-2 m-7 mt-2 bg-slate-200 rounded-full"></div> -->
                            {/if}
                            <div class="border-l-2 border-slate-100 flex-1"></div>
                          </div>
                          <div class="right education-details | text-sm">
                            {#if education.institution}<div class="institution sub-title font-medium">{education.institution}</div>{/if}
                            {#if education.area}
                              <span class="area">{education.area}</span>
                              {#if education.studyType}· <span class="studyType">{education.studyType}</span>{/if}
                            {/if}
                            {#if education.startDate && education.endDate}
                              <div class="education-dates | text-slate-500">
                                <span class="dates">{education.startDate} - {education.endDate}</span>
                                {#if education.location} · <span class="location">{education.location}</span>{/if}
                              </div>
                            {/if}
                            <div class="education-higher | mt-2">
                              {#if education.thesis}
                                {#if education.thesis.url}
                                  Thesis: <a class="" href="{education.thesis.url}" target="_blank" rel="noopener noreferrer">{education.thesis.title}</a>
                                {:else}
                                  <div class="thesis-title">Thesis: {education.thesis.title}</div>
                                {/if}
                              {/if}
                              {#if education.advisor}<div class="advisor">Advisor: {education.advisor}</div>{/if}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- skills -->
                {#if key=='skills' && resumeJson[key]}
                  <div class="section skills">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Skills"}
                    </div>
                    <div class="items | text-sm ">
                      {#each resumeJson.skills as skill}
                        <div class="item skill | mb-8">
                          {#if skill.name}
                            <div class="name sub-title font-bold text-slate-700 antialiased">{skill.name}
                              {#if skill.level}<span class="level text-sm text-slate-500">{skill.level}</span>{/if}
                            </div>
                          {/if}
                          {#if skill.description}<div class="description">{skill.description}</div>{/if}
                          {#if skill.keywords && skill.keywords.length}
                            <div class="keywords | mt-1">
                              {#each skill.keywords as keyword}
                                <span class="keyword _tag mb-1">{keyword}</span>
                              {/each}
                            </div>
                          {/if}
                          {#if skill.subskills && skill.subskills}
                            <div class="skills | mt-2 grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-4">
                              {#each skill.subskills as subSkill}
                                <div class="sub-skill | my-2">
                                  <div class="sub-skill-name | mb-1 text-base ">{subSkill.name}</div>
                                  <div class="sub-skill-description">{subSkill.description}
                                    {#if subSkill.level}<span class="sub-skill-level text-sm text-slate-500">{subSkill.level}</span>{/if}
                                  </div>
                                  {#if subSkill.details && subSkill.details.length}
                                    <ul class="details">
                                      {#each subSkill.details as detail}
                                        <li>{detail}</li>
                                      {/each}
                                    </ul>
                                  {/if}
                                  {#if subSkill.keywords && subSkill.keywords.length}
                                    <div class="keywords mt-1">
                                      {#each subSkill.keywords as keyword}
                                        <span class="keyword _tag mb-1">{keyword}</span>
                                      {/each}
                                    </div>
                                  {/if}
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- publications -->
                {#if key=='publications' && resumeJson[key]}
                  <div class="section publications">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Publications"}
                    </div>
                    <div class="items | items-cols">
                      {#each resumeJson.publications as publication}
                        <div class="item publication-item">
                          {#if publication.markdown}
                            <div class="publication-details markdown | text-sm">
                                {@html md.render(publication.markdown || '')}
                            </div>
                          {:else}
                            <div class="publication-details | text-sm">
                              <div class="name sub-title">{publication.name}</div>
                              <div class="publication-info | text-slate-500">
                                <span class="publisher">{publication.publisher}</span>
                                · 
                                <span class="releaseDate">{publication.releaseDate}</span>
                                · 
                                {#if publication.doi}
                                  <a href="https://doi.org/{publication.doi}" target="_blank" rel="noopener noreferrer"><span class="doi">{publication.doi}</span></a>
                                {:else if publication.url}
                                  <a href="{publication.url}" target="_blank" rel="noopener noreferrer">Link</a>
                                {/if}
                                <div class="summary">{publication.summary}</div>
                              </div>
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- awards -->
                {#if key=='awards' && resumeJson[key]}
                  <div class="section awards">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Awards & Honors"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.awards as award}
                        <div class="item award-item | text-sm">
                          <div class="award-details">
                            <div class="award-title sub-title">{award.title}</div>
                            <div class="award-info | text-slate-500">
                              <span class="date">{award.date}</span> ·
                              <span class="awarder">{award.awarder}</span>
                              {#if award.summary}<div class="summary">{award.summary}</div>{/if}
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- certificates -->
                {#if key=='certificates' && resumeJson[key]}
                  <div class="section certificates">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === "certificates")?.label || "Certificates"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.certificates as certificate}
                        <div class="item certificates-item | mb-4 ">
                          <div class="certificate-details | text-sm">
                            <div class="name sub-title">{certificate.name}</div>
                            {#if certificate.url}
                              <a href="{certificate.url}" class="item-link ">{certificate.issuer}</a>
                            {:else}
                              <span class="issuer sub-title text-slate-500">{certificate.issuer}</span>
                            {/if}
                            {#if certificate.date}<span class="date text-slate-500"> · {certificate.date}</span>{/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='talks' && resumeJson[key]}
                  <div class="section talks">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Talks & Presentations"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.talks as talk}
                        <div class="item talk-item | text-sm">
                          <div class="talk-details | ">
                            {#if talk.url}
                              <a href="{talk.url}" class="item-link block sub-title" target="_blank" rel="noopener noreferrer">{talk.title}</a>
                            {:else}
                              <div class="sub-title">{talk.title}</div>
                            {/if}
                            <div class="talk-info | text-slate-500">
                              <div class="event">{talk.event}</div>
                              <div class="date-location">{talk.date}, {talk.location}</div>
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='writings' && resumeJson[key]}
                  <div class="section writings | ">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Writings"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.writings as writing}
                        <div class="item writings-item | text-sm">
                          <div class="image-container ">
                            {#if writing.image}
                              <div class="image pr-2 pb-2">
                                <img class="rounded-sm w-32 h-16 object-contain object-left" src="{writing.image}" alt="{writing.title}"/>
                              </div>
                            {/if}
                            <div class="desc-container">
                              {#if writing.url}
                                <a href="{writing.url}" class="item-link name block text-base">{writing.title}</a>
                              {:else}
                                <div class="name block text-base">{writing.title}</div>
                              {/if}
                              <div class="writings-info | text-slate-500">
                                <div class="datePublished">{writing.datePublished || writing.date}
                                  {#if writing.publisher}
                                    · <span class="publisher">{writing.publisher}</span>
                                  {/if}
                                </div>
                                <div class="summary">{writing.summary}</div>
                              </div>  
                            </div>
                          </div>
                          {#if writing.keywords}
                            <div class="keywords">
                              {#each writing.keywords as keyword}
                                <span class="keyword _tag">{keyword}</span>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='media' && resumeJson[key]}
                  <div class="section media">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Media Appearances"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.media as mediaItem}
                        <div class="item media-item">
                          <div class="media-details | text-sm">
                            {#if mediaItem.url}
                              <a href="{mediaItem.url}" class="item-link sub-title block">{mediaItem.title}</a>
                            {:else}
                              <div class="sub-title">{mediaItem.title}</div>
                            {/if}
                            <div class="media-info | text-slate-500">
                              <span class="date">{mediaItem.date}</span>
                              {#if mediaItem.platform}
                                ·
                                <span class="platform">{mediaItem.platform}</span>
                              {/if}
                            </div>
                            {#if mediaItem.summary}<div class="summary">{mediaItem.summary}</div>{/if}
                            {#if mediaItem.keywords}
                              <div class="keywords | mt-1">
                                {#each mediaItem.keywords as keyword}
                                  <span class="keyword _tag">{keyword}</span>
                                {/each}
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='interests' && resumeJson[key]}
                  <div class="section interests">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Interests"}
                    </div>
                    <div class="items {resumeJson.interests.length>1 ? 'items-cols':''}">
                      {#each resumeJson.interests as interest, i}
                        <div class="item interest-item | mb-4 | {interest.keywords?'block':'inline-block'}">
                          <span class="name text-base">{interest.name}{#if !interest.keywords && i < resumeJson.interests.length - 1},&nbsp;{/if}
                          </span>
                          {#if interest.keywords}
                            <div class="keywords">
                              {#each interest.keywords as keyword}
                                <span class="keyword _tag">{keyword}</span>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if key=='languages' && resumeJson[key]}
                  <div class="section languages">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Languages"}
                    </div>
                    <div class="items flex gap-12">
                      {#each resumeJson.languages as language}
                        <div class="item language-item | mb-4 ">
                          <div class="language-details | text-sm">
                            <div class="language | sub-title">{language.language}</div>
                            <div class="fluency">{language.fluency}</div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if key=='volunteer' && resumeJson[key]}
                  <div class="section volunteer">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === key)?.label || "Volunteer Experience"}
                    </div>
                    <div class="items {resumeJson.volunteer.length > 1 ? 'items-cols' : ''} ">
                      {#each resumeJson.volunteer as experience}
                        <div class="item volunteer-item | mb-4 ">
                          <div class="experience-details | text-sm">
                            {#if experience.url}
                              <a href="{experience.url}" class="item-link organization block text-base">{experience.organization}</a>
                            {:else}
                              <div class="organization text-base">{experience.organization}</div>
                            {/if}
                            <div class="position">{experience.position}</div>
                            {#if experience.startDate}
                              <div class="dates | _slate">
                                <span class="startDate">{experience.startDate}</span>{#if experience.endDate}&ensp;&ndash;&ensp;<span class="endDate">{experience.endDate}</span>{/if}
                              </div>
                            {/if}
                            {#if experience.summary}<div class="summary">{experience.summary}</div>{/if}
                            {#if experience.highlights}
                              <ul class="highlights">
                                {#each experience.highlights as highlight}
                                  <li class="text-sm">{highlight}</li>
                                {/each}
                              </ul>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                {#if key=='references' && resumeJson[key]}
                  <div class="section references">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === "references")?.label || "References"}
                    </div>
                    <div class="items {resumeJson.references.length > 1 ? 'items-cols' : ''}">
                      {#each resumeJson.references as reference}
                        <div class="item references-item | mb-4 ">
                          <div class="reference-details | text-sm">
                            <div class="name sub-title">{reference.name}</div>
                            <div class="reference">{reference.reference}</div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='roles' && resumeJson[key]}
                  <div class="section roles">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === "roles")?.label || "Roles"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.roles as role}
                        <div class="item roles-item | mb-4 ">
                          <div class="role-details | text-sm">
                            {#if role.url}
                              <a href="{role.url}" class="item-link organization block sub-title">{role.organization}</a>
                            {:else}
                              <div class="organization sub-title">{role.organization}</div>
                            {/if}
                            <div class="position">{role.position}</div>
                            {#if role.startDate}
                              <div class="dates | _slate">
                                <span class="startDate">{role.startDate}</span>{#if role.endDate}&ensp;&ndash;&ensp;<span class="endDate">{role.endDate}</span>{/if}
                              </div>
                            {/if}
                            {#if role.summary}<div class="summary">{role.summary}</div>{/if}
                            {#if role.highlights}
                              <ul class="highlights">
                                {#each role.highlights as highlight}
                                  <li class="text-sm">{highlight}</li>
                                {/each}
                              </ul>
                            {/if}
                            {#if role.keywords}
                              <div class="keywords">
                                {#each role.keywords as keyword}
                                  <span class="keyword _tag">{keyword}</span>
                                {/each}
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
                {#if key=='projects' && resumeJson[key]}
                  <div class="section projects | ">
                    <div class="title {resumeJson.meta?.sections?.find(s => s.name === key)?.titleClass}">
                      {resumeJson.meta?.sections?.find(s => s.name === "projects")?.label || "Projects"}
                    </div>
                    <div class="items {resumeJson.roles>1 ? 'items-cols':''}">
                      {#each resumeJson.projects as item}
                        <div class="item project-item | text-sm">
                          <div class="image-container">
                            {#if item.image}
                              <div class="image pr-2 pb-2">
                                <img class="rounded-sm w-16 h-16 object-cover" src="{item.image}" alt="{item.name}"/>
                              </div>
                            {/if}
                            <div class="desc-container">
                              {#if item.url}
                                <a href="{item.url}" class="item-link name block sub-title">{item.name}</a>
                              {:else}
                                <div class="name sub-title">{item.name}</div>
                              {/if}
                              {#if item.startDate}
                                <div class="dates | _slate">
                                  <span class="startDate">{item.startDate}</span>{#if item.endDate}&ensp;&ndash;&ensp;<span class="endDate">{item.endDate}</span>{/if}
                                </div>
                              {/if}
                              {#if item.entity}<div class="entity">{item.entity}</div>{/if}
                              {#if item.type}<div class="type">{item.type}</div>{/if}
                              {#if item.roles}<div class="roles">{item.roles.join(", ")}</div>{/if}
                            </div>
                          </div>
                          {#if item.description}<div class="description">{item.description}</div>{/if}
                          {#if item.highlights}
                            <ul class="highlights">
                              {#each item.highlights as highlight}<li class="highlight ">{highlight}</li>{/each}
                            </ul>
                          {/if}
                          {#if item.keywords}
                            <div class="keywords">
                              {#each item.keywords as keyword}
                                <span class="keyword _tag">{keyword}</span>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
            
              {/each}

            </div>          
          {:else}
            No resume found at {id}
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</div>












<style lang="scss" global>

  .Resume {

    input, input[type=text] {
      margin-top: 0 !important;
    }

    .resume { // actual resume class
      @apply text-slate-800;
      
      // print styles
      // @media print {
      // }
    }

    .mdpara {
      // markdown paragraphs
      p {
        @apply inline-block mt-2;
      }
    }

    ._tag {
      @apply text-xs py-1 px-2 bg-slate-100 text-slate-700 rounded-sm mr-1 mb-1;
    }
    ._slate {
      @apply text-slate-500;
    }

    .title {
      @apply text-xl mb-2;
      @apply print:text-base print:mb-0;
    }
    .sub-title {
      @apply text-base;
      @apply print:text-sm;
    }

    .items-cols {
      @apply grid grid-cols-1 md:grid-cols-2 gap-4;
    }




    .section {
      @apply mt-16 print:mt-4;
      
      a {
        @apply text-blue-700 hover:text-blue-900 hover:underline;

        &.item-link {
          // too much blue! 
          @apply text-black hover:text-slate-800;
        }
      }


      .item {
        & > div { // single attribute
          @apply mt-2 print:mt-0;
        }
      }

      li {
        &:last-child {
          @apply mb-0;
        }
      }

    }


    li {
      @apply my-1;
      list-style: none;
      display: flex;

      &::before {
        content: '•';
        padding-right: 0.75rem;
      }
    }

    .preview-mode { // for preview mode

      .button {
        @apply border-blue-100 px-2 py-1 text-blue-700;
        &.active {
          @apply bg-blue-700 text-white;
        }
      }
    }


    // draggable
    .view-json {
      overflow: auto;
    }
    .handlebar {
      cursor: ew-resize;
      // background-color: #333;
      width: 8px;
      z-index: 10;
      position: relative;
      margin-left: -18px;
    }
    .view-resume {
      flex-grow: 1;
    }


  } // end .Resume




  // special templates

  .compact {
    .SocialBox {
      @apply grid grid-cols-2 gap-x-2 gap-y-1;
      svg {
        min-width: 20px;
        min-height: 20px;
      }
    }
    .section {
      @apply mt-3;
    }
  }

</style>
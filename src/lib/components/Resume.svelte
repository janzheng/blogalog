

<script>
  import Icon from '@iconify/svelte';
	import SocialBox from '$plasmid/components/SocialBox2.svelte'

  import { JSONEditor } from 'svelte-jsoneditor'


  export let resume, content;
  content = { text: '[1,2,3]' }

  if(resume) {
    content = {json: resume}
  }
  
  function handleChange(updatedContent, previousContent, { contentErrors, patchResult }) {
    // content is an object { json: unknown } | { text: string }
    console.log('onChange: ', { updatedContent, previousContent, contentErrors, patchResult })
    content = updatedContent
    resume = content.json
  }

</script>


<!-- {JSON.stringify(resume, null, 2)} -->
{#if content}
  <JSONEditor {content} onChange="{handleChange}" />
{/if}

{#if resume}
  <div class="resume | container mx-auto p-4">

    <!-- basic profile information -->
    <div class="basics | ">
      <!-- <div class="grid grid-cols-1-4 gap-2"> -->
      <div class="flex gap-4">
        <div class="">
          <img src={resume.basics?.image} alt="Jessica Sacher" class="rounded-full w-24 h-24 md:w-32 md:h-32 mb-4 object-cover" />
        </div>
        <div class="flex flex-col flex-1">
          <h1 class="text-xl font-medium">{resume.basics?.name}</h1>
          <div class="basics-summary mb-2">{resume.basics?.summary}</div>

          <div class="basics-primary text-sm text-slate-500">
            <p class="">{resume.basics?.label}</p>
            <p class="text-sm">
              {#if resume.basics?.location?.address}{resume.basics.location.address}{#if resume.basics.location.city || resume.basics.location.region || resume.basics.location.countryCode}, {/if}{/if}
              {#if resume.basics?.location?.city}{resume.basics.location.city}{#if resume.basics.location.region || resume.basics.location.countryCode}, {/if}{/if}
              {#if resume.basics?.location?.region}{resume.basics.location.region}{#if resume.basics.location.countryCode}, {/if}{/if}
              {resume.basics?.location?.countryCode||''}
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
            <div class="socialbox mb-2 ">
              <SocialBox classes="block" showFullLinks={true} iconClass="text-xl" linkClass="flex items-center mb-2 text-blue-500 hover:text-blue-700" email={resume.basics?.email} socialText={resume.basics?.profiles.map(p => p.url + '\n').join('')} />
            </div>
          </div>
        </div>
      </div>
    </div>

    {#if resume.basics?.about}
      <div class="section about">
        <div class="title">
          {resume.meta?.sections?.find(s => s.name === "about")?.label || "About"}
        </div>
        {#if resume.basics?.about}
          <p class="text-sm">{resume.basics?.about}</p>
        {/if}
      </div>
    {/if}

    <!-- work -->
    {#if resume.work}
      <div class="section work">
        <div class="title">
          {resume.meta?.sections?.find(s => s.name === "work")?.label || "Work Experience"}
        </div>
        <div class="items">
          {#each resume.work as work}
            <div class="item work-item | mb-4 | flex gap-2">
              <div class="work-logo left | flex flex-col justify-center items-center">
                {#if work.image}
                  <div class="w-16 h-16">
                    <!-- div wrapper forces width -->
                    <img src="{work.image}" alt="{work.name}" class="work-image w-16 h-16 object-contain">
                  </div>
                {:else}
                  <div class="w-12 h-12 m-2 flex justify-center items-center">
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
                  {#if work.name}<div class="name text-base font-medium">{work.name}</div>{/if}
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

    {#if resume.education}
      <div class="section education">
        <div class="title">
          {resume.meta?.sections?.find(s => s.name === "education")?.label || "Education"}
        </div>
        <div class="items">
          {#each resume.education as education}
            <div class="item education-item | mb-4 | flex gap-2">

              <div class="left | flex flex-col justify-center items-center">
                {#if resume.image}
                  <div class="w-16 h-16">
                    <!-- div wrapper forces width -->
                    <img src="{resume.image}" alt="{resume.name}" class="work-image w-16 h-16 object-contain">
                  </div>  
                {:else}
                  <div class="w-12 h-12 m-2 flex justify-center items-center">
                    <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                    <Icon class="mt-1 w-8 h-8 text-slate-400" icon="solar:square-academic-cap-outline" />
                    <!-- <Icon class="mt-1" icon="solar:square-academic-cap-bold" /> -->
                  </div>
                  <!-- <div class="w-2 h-2 m-7 mt-2 bg-slate-200 rounded-full"></div> -->
                {/if}
                <div class="border-l-2 border-slate-100 flex-1"></div>
              </div>
              <div class="right education-details | text-sm">
                {#if education.institution}<div class="institution text-base font-medium">{education.institution}</div>{/if}
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

    {#if resume.skills}
      <div class="section skills">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "skills")?.label || "Skills"}
        </div>
        <div class="items | text-sm ">
          {#each resume.skills as skill}
            <div class="item skill | mb-4">
              {#if skill.name}
                <div class="name text-base font-medium">{skill.name}
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

    {#if resume.publications}
      <div class="section publications">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "publications")?.label || "Publications"}
        </div>
        <div class="items | items-cols">
          {#each resume.publications as publication}
            <div class="item publication-item">
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
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if resume.awards}
      <div class="section awards">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "awards")?.label || "Awards & Honors"}
        </div>
        <div class="items items-cols">
          {#each resume.awards as award}
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

    {#if resume.talks}
      <div class="section talks">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "talks")?.label || "Talks & Presentations"}
        </div>
        <div class="items items-cols">
          {#each resume.talks as talk}
            <div class="item talk-item | text-sm">
              <div class="talk-details | ">
                {#if talk.url}
                  <a href="{talk.url}" class="block sub-title" target="_blank" rel="noopener noreferrer">{talk.title}</a>
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


    {#if resume.writings}
      <div class="section writings | ">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "writings")?.label || "Writings"}
        </div>
        <div class="items items-cols">
          {#each resume.writings as writing}
            <div class="item writings-item | text-sm">
              <div class="image-container ">
                {#if writing.image}
                  <div class="image pr-2 pb-2">
                    <img class="rounded-sm w-32 h-16 object-contain object-left" src="{writing.image}" alt="{writing.title}"/>
                  </div>
                {/if}
                <div class="desc-container">
                  {#if writing.url}
                    <a href="{writing.url}" class="name block text-base">{writing.title}</a>
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

    {#if resume.media}
      <div class="section media">
        <div class="title | ">
          Media Appearances
        </div>
        <div class="items items-cols">
          {#each resume.media as mediaItem}
            <div class="item media-item">
              <div class="media-details | text-sm">
                {#if mediaItem.url}
                  <a href="{mediaItem.url}" class="sub-title block">{mediaItem.title}</a>
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

    {#if resume.interests}
      <div class="section interests">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "interests")?.label || "Interests"}
        </div>
        <div class="items">
          {#each resume.interests as interest, i}
            <div class="item interest-item | mb-4 | {interest.keywords?'block':'inline-block'}">
              <span class="name text-base">{interest.name}{#if !interest.keywords && i < resume.interests.length - 1},&nbsp;{/if}
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

    {#if resume.roles}
      <div class="section roles">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "roles")?.label || "Roles"}
        </div>
        <div class="items items-cols">
          {#each resume.roles as role}
            <div class="item roles-item | mb-4 ">
              <div class="role-details | text-sm">
                {#if role.url}
                  <a href="{role.url}" class="organization block text-base">{role.organization}</a>
                {:else}
                  <div class="organization text-base">{role.organization}</div>
                {/if}
                <div class="position">{role.position}</div>
                {#if role.startDate}
                  <div class="dates | _slate">
                    <span class="startDate">{role.startDate}</span>{#if role.endDate}&ensp;&ndash;&ensp;<span class="endDate">{role.endDate}</span>{/if}
                  </div>
                {/if}
                {#if role.summary}<div class="summary">{role.summary}</div>{/if}
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

    {#if resume.projects}
      <div class="section projects | ">
        <div class="title | ">
          {resume.meta?.sections?.find(s => s.name === "projects")?.label || "Projects"}
        </div>
        <div class="items | grid grid-cols-2 gap-4">
          {#each resume.projects as item}
            <div class="item project-item | text-sm">
              <div class="image-container {item.image && 'flex gap-2'}">
                {#if item.image}
                  <div class="image pr-2">
                    <img class="rounded-sm w-16 h-16 object-cover" src="{item.image}" alt="{item.name}"/>
                  </div>
                {/if}
                <div class="desc-container">
                  {#if item.url}
                    <a href="{item.url}" class="name block text-base">{item.name}</a>
                  {:else}
                    <div class="name text-base">{item.name}</div>
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

  </div>
{/if}












<style lang="scss">

  ._tag {
    @apply text-xs py-1 px-2 bg-slate-100 rounded-sm mr-1 mb-1;
  }
  ._slate {
    @apply text-slate-500;
  }

  .title {
    @apply text-xl mb-2;
  }
  .sub-title {
    @apply text-base;
  }

  .items-cols {
    @apply grid grid-cols-1 md:grid-cols-2 gap-4;
  }



  .section {
    @apply mt-8;
    
    a {
      @apply text-blue-700 hover:text-blue-900 hover:underline;
    }

    .item {
      & > div { // single attribute
        @apply mt-1;
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




</style>
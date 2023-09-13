<script>

  export let isImageLinks;
  export let _format;
  export let getCover;
  export let record;
  export let _coverAspect;
  export let hideGalleryTitles;
  export let CollectionProp;
  export let isProfiles;
  export let getRecordItems;
  export let tableData;
  export let api;

</script>

















{#if isImageLinks}
    <div class="notion-galleryboard-item notion-galleryboard-imagelinks">
      {#if _format.gallery_cover}
        <div class="notion-galleryboard-cover">
          {#if getCover(record)}
            {#if record['URL']}
              <a href={record['URL']}>
                <img
                  style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                  alt={getCover(record).name}
                  src={getCover(record).url} />
                {#if record['Name'] && !hideGalleryTitles}
                  {record['Name']}
                {/if}
              </a>
            {:else}
              <img
                style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                alt={getCover(record).name}
                src={getCover(record).url} />
              {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
            {/if}
            <div class="notion-galleryboard-description">
              {#each getRecordItems(record, ['Name']) as item}
                <div class="notion-item">
                  <CollectionProp
                    fieldItem={item.value}
                    {tableData}
                    {api}
                    {record}
                    schema={item.schema} />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else if isProfiles}
    <div class="notion-galleryboard-item notion-galleryboard-profile">
      {#if _format.gallery_cover}
        <div class="notion-galleryboard-cover">
          {#if getCover(record)}
            {#if record['URL']}
              <a href={record['URL']}>
                <img
                  style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                  alt={getCover(record).name}
                  src={getCover(record).url} />
              </a>
            {:else}
              <img
                style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                alt={getCover(record).name}
                src={getCover(record).url} />
            {/if}
          {/if}
        </div>
      {/if}
      <div class="notion-galleryboard-description">
        {#if record['URL']}
          <a
            class="notion-galleryboard-name"
            sapper:prefetch
            href={record['URL']}>
            {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
          </a>
        {:else if record['Name'] && !hideGalleryTitles}
          <span class="notion-galleryboard-name">{record['Name']}</span>
        {/if}
        {#each getRecordItems(record, ['Name']) as item}
          <div class="notion-item">
            <CollectionProp
              fieldItem={item.value}
              {tableData}
              {api}
              {record}
              schema={item.schema} />
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="notion-galleryboard-item">
      {#if _format.gallery_cover}
        <div class="notion-galleryboard-cover">
          {#if record['URL']}
            <a href={record['URL']}>
              <img
                style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
                alt={getCover(record).name}
                src={getCover(record).url} />
            </a>
          {:else}
            <img
              style={_coverAspect ? `object-fit: ${_coverAspect}` : ``}
              alt={getCover(record).name}
              src={getCover(record).url} />
            {#if record['Name'] && !hideGalleryTitles}{record['Name']}{/if}
          {/if}
        </div>
      {/if}
      <div class="notion-galleryboard-props">
        {#each getRecordItems(record) as item}
          <div class="notion-item">
            <CollectionProp
              fieldItem={item.value}
              {tableData}
              {api}
              {record}
              schema={item.schema} />
          </div>
        {/each}
      </div>
    </div>
  {/if}
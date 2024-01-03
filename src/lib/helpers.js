

// if First is higher: > 0
// if Second is higher: < 0
// console.log(compareVersions(1.5, 2));  // Output: -1
// console.log(compareVersions(3, 3));    // Output: 0
// console.log(compareVersions(4.5, 4));  // Output: 0
// console.log(compareVersions(5, 4.2));  // Output: 1
// console.log(compareVersions('1.2.3', '1.2.4'));  // Output: -1
export const compareVersions = (version1, version2) => {
  if (!isNaN(version1) && !isNaN(version2)) {
    // Both version1 and version2 are numbers
    if (version1 > version2) {
      return 1;
    } else if (version1 < version2) {
      return -1;
    } else {
      return 0;
    }
  }

  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) {
      return 1;
    } else if (v1Parts[i] < v2Parts[i]) {
      return -1;
    }
  }

  return 0;
}



// input is either a valid JSON string of a bunch of \n key:value pairs
export function parseMetadata(metadataInput = "key:value", splitChar = '\n') {
  let metadata = {};
  // let { splitChar } = options;
  if (!metadataInput || metadataInput.length == 0)
    return {}

  if (typeof input === 'string' && metadataInput.trim().startsWith('{')) {
    // Metadata is a JSON string
    metadata = JSON.parse(metadataInput);
  } else if (typeof metadataInput === 'string') {
    // Metadata is a splitChar separated list of key/val pairs
    metadataInput?.split(splitChar).forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        metadata[key.trim()] = value.trim();
      }
    });
  }
  return metadata;
}



export function getNotionImageLink(notionImage) {
  /* 
    we want rawUrl whenever possible, EXCEPT when it contains "https://prod-files-secure.s3" which doesn't render properly
  */
 if(!notionImage) return null
 
  let fileObj = notionImage?.Files?.[0] || notionImage?.[0] || notionImage
  let url // = notionImage?.Content // defunct; images should be in .Cover or other explicit URL fields! Many items use .Content for text

  // console.log('fileObj:',fileObj)
  const links = ["https://prod-files-secure.s3", "//s3-us-west-2.amazonaws"];
  if (!url) url = links.some(link => fileObj?.rawUrl?.includes(link)) ? fileObj?.url : fileObj?.rawUrl;
  // console.log('url1:',url)
  if (!url) url = fileObj?.url
  // console.log('url2:',url)
  if( !url) url = notionImage?.Cover
  if (!url && notionImage.includes && notionImage.includes("http")) url = notionImage
  
  return url
}






export function generatePageStyles(settingsPage, settings={}) {
  if (!settingsPage) return null
  
  const acceptedKeys = [
    '--font-title',
    '--font-paragraph',
    '--blogalog-page-width',
    '--blogalog-page-width',
    '--blogalog-post-width', 
    '--blogalog-page-custom-width',
    '--color-base',
    '--color-title',
    '--color-link',
    '--color-link-hover',
    '--color-bg',
    '--color-primary',
    '--color-primary-hover',
    '--color-primary-white',
    '--color-primary-active',
    '--color-primary-light',
    '--color-primary-dark',
    '--color-primary-ring',
    '--color-primary-ring-active',
    '--color-primary-text',
    '--slideup-distance',
    '--slideup-duration',
  ];

  const pageStyles = acceptedKeys.reduce((acc, key) => {
    if (settingsPage[key.slice(2)]) {
      acc[key] = settingsPage[key.slice(2)];
    }
    return acc;
  }, {});

  if(settings.type == 'string') {
    // string for style={"..."}
    return Object.entries(pageStyles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
  
  // object for document.documentElement.style.setProperty
  return pageStyles;

}
export function slideUp(onMount, {itemSelector = '.slideup', containerSelector = '.slideupContainer', visibleClass = 'visible'} = {}) {
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(visibleClass);
        }
      });
    });

    const items = document.querySelectorAll(itemSelector);
    const containers = document.querySelectorAll(containerSelector);

    items.forEach(item => {
      if (isInViewport(item)) {
        item.classList.add(visibleClass);
      }
      observer.observe(item);
    });

    containers.forEach(container => {
      Array.from(container.children).forEach(child => {
        if (isInViewport(child)) {
          child.classList.add(visibleClass);
        }
        observer.observe(child);
      });
    });
  });
}

export const cleanDirectoryData = (sites) => {
  return sites.map(site => {
    const keys = ['id', 'Pagedata ID', 'Status', 'Slug', 'Style', 'URLs', 'Name'];
    return keys.reduce((obj, key) => (key in site ? { ...obj, [key]: site[key] } : obj), {});
  });
}

export const cleanNotionPageData = (page) => {
  // these are the notion-db records for each site, e.g. each row of site like Settings or Main
  let sitePageData = page.value?.['site-pagedata']?.map(page => {
    delete page.id;
    delete page.format;
    delete page['Created By'];
    delete page.version;
    delete page.created_time;
    delete page.last_edited_time;
    delete page.parent_id;
    delete page.parent_table;
    delete page.alive;
    delete page.version;
    delete page.copied_from;
    delete page.created_by_table;
    delete page.created_by_id;
    delete page.last_edited_by_table;
    delete page.last_edited_by_id;
    delete page.space_id;
    if (page.pageBlocks && page.pageBlocks.length <= 5) {
      // every page comes w/ pageblocks, which clogs up data
      // "empty" pages will have len=4 pageBlocks so we just delete them here
      delete page.pageBlocks
    } else {
      page.pageBlocks = page.pageBlocks?.map(block => {
        const keys = ['id', 'collection_id', 'parent_id', 'format', 'properties', 'type', 'content'];
        // const keys = ['id', 'collection_id', 'parent_id', 'format', 'properties', 'type', 'content'];
        // const keys = ['id', 'collection_id', 'parent_id', 'properties', 'type', 'content', 'alive', 'copied_from', 'created_by_id', 'created_by_table', 'created_time', 'format', 'last_edited_by_id', 'last_edited_by_table', 'last_edited_time', 'parent_table', 'space_id', 'version'];
        // const keys = ['id', 'collection_id', 'format', 'parent_id', 'properties', 'type', 'content', 'created_time', 'parent_table', 'space_id', 'version'];
        let strippedBlock = keys.reduce((obj, key) => {
          if (block[key] !== undefined) {
            obj[key] = block[key];
          }
          return obj;
        }, {});
        // format key needs to be an empty object
        delete strippedBlock.format?.['copied_from_pointer'];
        return strippedBlock
      });
    }

    
    return page
  });

  return {
    status: page.status,
    key: page.key,
    metadata: page.metadata,
    cacheStatus: page.cacheStatus,
    value: {
      "secrets": page.value?.secrets,
      "site-pagedata": sitePageData,
    }
  }
}







// export const attendeeDictMap = {
//   // left is the key used in template, e.g. {{name}}
//   // right is the key in the data object, e.g. {{firstName}}
//   "templateKey": "dataKey",
//   "name": "firstName",
//   "email": "emailAddress",

//   // airable fields; overrides previous
//   "ticketId": "TicketId",
//   "name": "Name",
//   "email": "Email",
//   "username": "Username",
//   "profile": "Profile",
//   "registration": "Registration",
//   "status": "Status",
//   "ticketLink": "Access Link",

//   "institution": "Institution",
//   "position": "Position",
//   "country": "Country",
//   "interest": "Research Interest",
//   "intent": "Intent",
//   "role": "Role",
//   "workshops": "Workshops",
//   "contribute": "Contribute",
//   "hiking": "Hiking",
//   "diet": "Diet",
//   "visa": "Visa Letter",

//   "stripeProd": "Stripe Product",
//   "ticketPrice": "Ticket Price",
//   "receiptId": "Receipt ID",

//   "abstract": "Abstract",
//   "abstractId": "AbstractId",
//   "abstractName": "AbstractTitle",
//   "authors": "Authors",
//   "_id": "_id",

//   // evaluated fields
//   hasPaid: "hasPaid",
//   hasRegistered: "hasRegistered",
//   hasAbstract: "hasAbstract",
// }

// export const abstractDictMap = {
//   // left is the key used in template, e.g. {{name}}
//   // right is the key in the data object, e.g. {{firstName}}
//   "email": "Email",
//   "abstractId": "AbstractId",
//   "acceptance": "AcceptanceStatus",
//   "type": "Type",
//   "category": "Category",
//   "title": "Title", // title
//   "authors": "Authors",
//   "affiliations": "Affiliations",
//   "correspondence": "Correspondence",
//   "keywords": "Keywords",
//   "body": "Body",
//   "slug": "Slug",
//   "abstractUrl": "AbstractUrl",
//   "posterUrl": "PosterUrl",
//   "youtube": "Youtube", // flash talk
//   "_id": "_id"
// }


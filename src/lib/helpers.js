

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






export function generatePageStyles(settingsPage) {
  if (!settingsPage) return null
  
  const acceptedKeys = [
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
    '--color-primary-text'
  ];

  const pageStyles = acceptedKeys.reduce((acc, key) => {
    if (settingsPage[key.slice(2)]) {
      acc[key] = settingsPage[key.slice(2)];
    }
    return acc;
  }, {});

  return Object.entries(pageStyles)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}



export function observeVisibility(onMount, itemSelector = '.item', visibleClass = 'visible') {
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
    items.forEach(item => {
      if (isInViewport(item)) {
        item.classList.add(visibleClass);
      }
      observer.observe(item);
    });
  });
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


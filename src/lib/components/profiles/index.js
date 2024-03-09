
// profile helpers



export function buildPageOrder({ sitePages, pageOrder=[], sections=[] }={}) {
  // build the sections list
  sitePages?.forEach(page => {
    if (page?.Type) {
      const Section = page.Section;
      if (Section && Section.length > 0 && Section !== ' ') {
        // console.log('Section -->', `[${Section}]`)
        const sectionExists = sections.find(section => section.Section === Section);
        if (sectionExists) {
          sectionExists.pages.push(page);
        } else {
          const newSection = { Section: Section, SectionDescription: page.SectionDescription, pages: [page] };
          sections.push(newSection);
        }
      }
    }
  });
  // build the pageOrder list
  sitePages?.forEach(page => {
    pageOrder.push(page);
    if (page.Section && !pageOrder.find(pageOrderPage => pageOrderPage.Group === page.Section)) {
      const section = sections.find(section => section.Section === page.Section);
      if (section) {
        const newObject = { Name: section.Section, Group: section.Section, Type: ['Group'], Pages: section.pages, SectionDescription: section.SectionDescription };
        pageOrder.push(newObject);
      }
    }
  });
  pageOrder = pageOrder.filter(item => (!item.Section || item.Section == ' '));
  // console.log('pageOrder 1:', pageOrder, 'sections:', sections);
  return pageOrder
} 
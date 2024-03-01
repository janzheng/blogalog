

import { PUBLIC_SHEET_URL } from '$env/static/public';
import sheet, { Sheet } from '@yawnxyz/sheetlog';


sheet.setup({
  sheetUrl: PUBLIC_SHEET_URL,
  sheet: "Resumes"
});

console.log('whatwhatwhat', sheet, PUBLIC_SHEET_URL)



export const load = async ({ url, params }) => {

  let id = params.id || url.searchParams.get('id');
  let preview = params.preview || url.searchParams.get('preview');
  let resume


  try {
    if(id) {
      console.log('&&#$*%&#$*%&#$%&* loading from sheet', id, PUBLIC_SHEET_URL, sheet)
      let result = await sheet.find("Id", id);
      if (result?.data?.ResumeText) {
        resume = JSON.parse(result.data?.ResumeText);
      } else {
        throw new Error("No results found for id: " + id);
      }
    }
    return {
      id,
      preview,
      resume,
    }

  } catch (e) {
    console.error(e)
  }


  return {
    id,
    preview
  }
}
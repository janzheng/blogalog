

import { PUBLIC_SHEET_URL } from '$env/static/public';
import sheet, { Sheet } from '@yawnxyz/sheetlog';


sheet.setup({
  sheetUrl: PUBLIC_SHEET_URL,
  sheet: "Resumes"
});



export const load = async ({ url, params }) => {

  let id = params.id || url.searchParams.get('id');
  let preview = params.preview || url.searchParams.get('preview');
  let resume


  try {
    if(id) {
      let result = await sheet.find("Id", id);
      if (result.data?.ResumeText) {
        resume = JSON.parse(result.data?.ResumeText);
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
}
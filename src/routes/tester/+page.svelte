<script>
  import { browser } from '$app/environment';

  const defaultFont = "Inter";
  const defaultWeight = "400";
  const defaultStyle = "normal";
  const defaultUrl = "https://cdn.jsdelivr.net/fontsource/fonts";

  // Font bound to the selected value
  let font = defaultFont;

  // Font updated when the selected font has been loaded. This one could be a store value to use anywhere.
  let currentFont = font;

  // Records of all fonts already loaded
  let loadedFonts = [];

  function loadFontFace(fontName = defaultFont, fontWeight = defaultWeight, fontStyle = defaultStyle, url = defaultUrl) {
    fontName = fontName.toLowerCase().replace(/\s+/g, '-');
    const fontKey = `${fontName}-${fontWeight}-${fontStyle}`;
    if (loadedFonts.includes(fontKey)) {
      currentFont = fontName;
    } else {
      const new_font = new FontFace(fontName, `url(${url}/${fontName}@latest/latin-${fontWeight}-${fontStyle}.ttf)`);
      new_font.load().then(function(loaded_face) {
        document.fonts.add(loaded_face);
        currentFont = fontName;
        loadedFonts.push(fontKey);
      }).catch(function(error) {
        // Something went wrong, use default font
        currentFont = defaultFont;
      });
    }
  }

  $: if(browser && font) {
    loadFontFace(font);
  }
</script>

<select bind:value={font}>
  <option value="Inter">Inter</option>
  <!-- <option value="Roboto">Roboto</option> -->
  <option value="Tapestry">Tapestry</option>
</select>

<div style:font-family={currentFont}>
  Hello {font}!? // {currentFont} <strong>here's some BOLD TEXT</strong> <em>and italic text</em>
</div>

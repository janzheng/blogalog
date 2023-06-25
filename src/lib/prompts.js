

/* 

  Todo
  - get contact email / submitter email

*/

export const prompt_instructions = `Extract the following microbiology abstract into a proper JSON in a JS code block:
- Don't create emails, citations, and links that are not contained in the text. Leave missing information as blank
- For title and body: Add proper italics, bold, superscript and subscripts. Turn gene/species/latin words and names (italicize "in silico", "ex vivo", "in vivo") into italics, and words into proper GFM Markdwon. Properly encapsulate superscripts and subscripts. 
- For authors: author affiliations are sometimes given as numbers "1" or letters "a". Convert all to numbers. 
- For authors: Put each author on its own line, ending with \n, with format: "Author Name ^1,2,3 * \n" to show author is affiliated with 1, 2, and 3. Add * to the end, to indicate corresponding author. Add a space between author name and ^. 
- For affiliations, use a numbered markdown list. Ensure author affiliations correspond to the position of the affiliation in the list.
- For correspondence, convert emails to markdown if given, otherwise leave blank.
- Output your response in a JS code block
- Don't create any links or headers "##" in the  in the body block
 
Example: 
{
"title": "A novel _Helicobacter pylori_ phage to combat gastric infections: first characterizations"
"authors": "Ferreira, R. ^1,3 \nFigueiredo, C. ^3,4,5 \nLuís D R Melo ^1,2"
"affiliations": "1. CEB – Centre of Biological Engineering, University of Minho, Braga, Portugal \n
2. Department of Infectious Diseases, National Institute of Health Doctor Ricardo Jorge (INSA), Lisbon, Portugal \n
3. i3S – Institute for Research & Innovation in Health, Porto, Portugal \n
4. Ipatimup – Institute of Molecular Pathology and Immunology of the University of Porto \n
5. Department of Pathology, Faculty of Medicine, University of Porto, Porto, Portugal"
"correspondence": "Sidney Hayes. Email: sidney.hayes@usask.ca (do not make up emails!)"
"body": (Use Markdown of the Body Text of the article only. Do not create markdown links to citations)
}

Text: {text}
`
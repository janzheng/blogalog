
/* 

  UNTESTED - works directly with the Notion API

*/


import notionClient from "@notionhq/client";


export const notionLoader = async (src) => {
  let notion
  if(!notion) notion = new notionClient({ auth: process.env.NOTION_API });
  const response = await notion.databases.query({
    database_id: src.inputs.dbid,
    filter: src.inputs.filter,
    sorts: src.inputs.sorts,
    // filter: {
    //   or: [
    //     {
    //       property: 'In stock',
    //       checkbox: {
    //         equals: true,
    //       },
    //     },
    //     {
    //       property: 'Cost of next trip',
    //       number: {
    //         greater_than_or_equal_to: 2,
    //       },
    //     },
    //   ],
    // },
    // sorts: [
    //   {
    //     property: 'Name',
    //     // direction: 'ascending',
    //     direction: 'descending',
    //   },
    // ],
  });

  console.log('NOTION:::::', response.results);
  let resarr = []
  response.results.map(res => {
    let _data = {}
    Object.keys(res.properties).map(key => {
      let keydata = res.properties[key][res.properties[key]['type']]
      // _data[key] = res.properties[key][res.properties[key]['type']]

      if (keydata && Array.isArray(keydata)) {
        let aggr
        keydata.map(item => {
          if(item.type == 'text') {
            // text
            if (!aggr) aggr = ''

            // plaintext
            // aggr.push(item[item.type].plain_textl)
            // aggr += (item.plain_text)
            
            // start
            if (item.annotations.bold)
              aggr += '*'
            if (item.annotations.italic)
              aggr += '**'
            if (item.annotations.strikethrough)
              aggr += '--'
            if (item.annotations.underline)
              aggr += '_'
            if (item.annotations.code)
              aggr += '`'

              if(item.text && item.text.link) {
                aggr += `[${item.plain_text}](${item.text.link.url})`
              }
              else
                aggr += (item.plain_text)

            // end
            if (item.annotations.code)
              aggr += '`'
            if (item.annotations.underline)
              aggr += '_'
            if (item.annotations.strikethrough)
              aggr += '--'
            if (item.annotations.italic)
              aggr += '**'
            if (item.annotations.bold)
              aggr += '*'


          } else if (item.type == 'external') {
            // external attachments
            if(!aggr) aggr = []
            aggr.push(item[item.type].url)
          } else if (item.type == 'file') {
            // external attachments
            if (!aggr) aggr = []
            aggr.push(item[item.type].url)

          } else if (item.type == 'name') {
            // multi-sel
            if (!aggr) aggr = []
            aggr.push(item[item.name])
          }

        })
        // relation (won't work, only returns id)

        if(aggr)
          _data[key] = aggr
      } else if (keydata) {
        // single date
        if (keydata.start && !keydata.end) {
          _data[key] = keydata.start

        } else if (keydata.name) {
          // single sel
          _data[key] = keydata.name
        } else if (keydata.type == 'array') {
          // relation rollup
          // _data[key] = keydata.name
          // needs to call this resolver fn iteratively
        } 
        else {
          // catch the rest
          _data[key] = keydata
        }
      }
    })
    // console.log('----> ', res.properties)
    // console.log('----> ', _data,)
    // console.log('----> ', '---oooo', _data['Long Notes'])
    resarr.push(_data)
  })

  return resarr
  


}



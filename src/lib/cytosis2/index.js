

import { csv } from 'csvtojson' 
import { Client } from '@notionhq/client'
import Cytosis from 'cytosis'





export const endo = async (config) => {
  let data = {}

  console.log('[grab] Starting the grabbing!')
  await Promise.all(config.sources.map(async src => {
    console.log('[grab] >> grab-ing:', src.name, src.type, src.key, src.inputs)

    // get json file
    if (src.type == 'json') {
      if (config.flat)
        data = { ...data, ...require(src.inputs.path) }
      else
        data[src.name] = require(src.inputs.path)
    }

    // get csv file
    if (src.type == 'csv') {

      if (config.flat)
        data = { ...data, ...await csv().fromFile(src.inputs.path) }
      else
        data[src.name] = await csv().fromFile(src.inputs.path)
    }

    // get google sheet using API
    if (src.type == 'gsheet') {
      const response = await fetch(src.inputs.csv_url);
      const csv_text = await response.text();

      if (config.flat)
        data = { ...data, ...await csv().fromString(csv_text) }
      else
        data[src.name] = await csv().fromString(csv_text)
    }

    // get json from an api endpoint
    if (src.type == 'json-api') {
      let _data = {}
      if (src.inputs.url) {
        const response = await fetch(src.inputs.url);
        const json = await response.json();
        _data = json
      }
      if (src.inputs.urls) {
        let arr = []
        await Promise.all(src.inputs.urls.map(async url => {
          const response = await fetch(url);
          const json = await response.json();
          arr.push(json)
        }))
        _data = arr
      }

      if (config.flat)
        data = { ...data, ..._data }
      else
        data[src.name] = _data
    }

    // get airtable using Cytosis
    if (src.type == 'airtable') {
      let _cytosis = await new Cytosis({
        apiKey: process.env[src.inputs.apiKey],
        baseId: process.env[src.inputs.baseId],
        bases: src.inputs.bases,
        flat: true,
      })

      if (config.flat)
        data = { ...data, ..._cytosis.results }
      else
        data[src.name] = _cytosis.results
    }


    // get notion from cloudflare-notion endpoint
    if (src.type == 'cfnotion') {
      let _data = {}
      if (src.inputs.url && src.inputs.ids) {
        let arr = []
        await Promise.all(src.inputs.ids.map(async id => {
          const response = await fetch(`${src.inputs.url}/v1/${id}`);
          const json = await response.json();
          arr.push(json)
        }))
        _data = arr
      }

      if (config.flat)
        data = { ...data, ..._data }
      else
        data[src.name] = _data
    }

    // get notion using official API
    if (src.type == 'notion') {
      // const response = await notion.databases.retrieve({ database_id: databaseId });
      if (!notion) notion = new Client({ auth: process.env.NOTION_API });
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

      // console.log('NOTION:::::', response.results);
      let resultArr = []
      response.results.map(res => {
        let _data = {}
        Object.keys(res.properties).map(key => {
          let keydata = res.properties[key][res.properties[key]['type']]
          // _data[key] = res.properties[key][res.properties[key]['type']]

          if (keydata && Array.isArray(keydata)) {
            let aggr
            keydata.map(item => {
              if (item.type == 'text') {
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

                if (item.text && item.text.link) {
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
                if (!aggr) aggr = []
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

            if (aggr)
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
        resultArr.push(_data)
      })

      if (config.flat)
        data = { ...data, ...resultArr }
      else
        data[src.name] = resultArr
    }

  }))

  console.log('[endo] Done! Saving data ------')
  // await saveJson(data)
  return data
}
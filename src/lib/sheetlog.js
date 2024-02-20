
/* 

  payload can be an object or an array of objects of any schema
  - deeper nested JSON will be stringified in a cell, not spread across the csv

*/

// import { Sema } from 'async-sema'
// import Sqids from 'sqids'
// import dotenv from 'dotenv'


class Sheet {
  constructor() {
    this.loud = false
    this.logPayload = true;
    // this.concurrency = 2; // not implemented
    this.useSqid = false;
    this.contentType = 'application/json';
    this.sheet = "Logs";
    this.method = "POST";

    // doing all this so we can use this on the browser
    // which is NOT SAFE since the URL is exposed
    // but YOLO
    if (typeof process !== 'undefined') {
      // Dynamically import dotenv if process is defined
      import('dotenv').then(dotenv => {
        dotenv.config();
        this.SHEET_URL = process.env['SHEET_URL'];
      }).catch(error => {
        console.error('Failed to load dotenv:', error);
      });
    } else {
      this.contentType = 'application/x-www-form-urlencoded';
      // only form types can be submitted to spreadAPI from the browser
      if (this.loud) {
        console.log('Browser mode: set a custom sheetUrl');
      }
    }

    // Dynamically import Sqids if available
    import('sqids').then(SqidsModule => {
      this.sqids = new SqidsModule.default();
    }).catch(error => {
      console.warn('Sqids module not found. Proceeding without it.');
      this.useSqid = false; // Disable Sqid usage if the module is not found
    });
  }

  setup({ sheetUrl, logPayload, useSqid, sheet, method }) {
    this.SHEET_URL = this.SHEET_URL || sheetUrl;
    this.logPayload = logPayload || this.logPayload;
    // this.concurrency = concurrency || this.concurrency;
    this.useSqid = useSqid || this.useSqid;
    this.sheet = sheet || this.sheet;
    this.method = method || this.method;
  }

  async log(payload, { sheet, sheetUrl, sqid, method, id, idColumn } = {}) {
    // const semaAdd = new Sema(this.concurrency);
    sheet = sheet || this.sheet;
    let data;
    // await semaAdd.acquire();
    try {
      if (this.useSqid) {
        sqid = sqid || [new Date().getTime()]
        payload['sqid'] = this.useSqid && this.sqids.encode(sqid);
      }

      if (!this.SHEET_URL && !sheetUrl) {
        throw new Error('SHEET_URL not set');
        return;
      }

      const bodyObject = {
        "method": method || this.method,
        "sheet": sheet,
        "payload": payload,
      }
      if (id) bodyObject.id = id;
      if (idColumn) bodyObject.idColumn = idColumn;

      const response = await fetch(this.SHEET_URL || sheetUrl, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json'
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(bodyObject)
      })

      try {
        data = await response.json()
      } catch (e) { }
      if (this.logPayload) {
        console.log(bodyObject);
      }
    } finally {
      // semaAdd.release();
    }
    return data;
  }

  async update(payload, options = {}) {
    // Set the method to "UPSERT" and pass all other options through
    return this.log(payload, { ...options, method: "UPSERT" });
  }

  async add(payload, options = {}) {
    // .add uses DYNAMIC_POST which can add new columns if they don't already exist
    return this.log(payload, { ...options, method: "DYNAMIC_POST" });
  }

  async find(idColumn, id, returnAllMatches = false) {
    // Directly pass the method "FIND" and the specific parameters
    return this.log({}, { idColumn, id, returnAllMatches, method: "FIND" });
  }
}

export { Sheet };
export default new Sheet();


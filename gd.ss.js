const { google } = require('googleapis')
const { throws, assertsObj, createClientV3 } = require('./gd.util.js')
const pathexists = require('path-exists')
const fs = require('fs')
const mkdir = require('util').promisify(fs.mkdir)

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN_SELF } = process.env
const outdir = '.dist/spreadsheet'

Promise.resolve()
.then(() =>
  assertsObj({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN_SELF })
)
.then(() =>
  pathexists(outdir).then(isExist => !isExist && mkdir(outdir))
)
.then(() =>
  createClientV3(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN_SELF)
)
.then(({ files: client }) =>
  Promise.all(
    [
      ['prevent.sids.pdf', '1JGRNj01auKe2epnXdrlFqS5ClrR4zl6BMX2dJgSOYV8'],
      ['check.afternoon.pdf', '1_M99_etDb2FkKBi4Wfqvf3O0Hd6k1TDuHRhGzBVkF30']
    ]
    .map(([ filename, fileId ]) =>
      client
      .export(
        { fileId, mimeType: 'application/pdf', prettyPrint: true },
        { responseType: 'stream' }
      )
      .then(({ data: stream }) =>
        stream
        .on('end', () => console.log('done'))
        .on('error', err => console.error(err))
        .pipe(fs.createWriteStream(`.dist/spreadsheet/${filename}`))
      )
    )
  )
)
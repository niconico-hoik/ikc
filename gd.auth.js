const { google } = require('googleapis')
const opn = require('opn')
const readline = require('readline')
const dotenv = require('dotenv')
const writeFile = require('util').promisify(require('fs').writeFile)
const { assertsObj } = require('./gd.util.js')

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env

const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

Promise.resolve()
.then(() => assertsObj({ CLIENT_ID, CLIENT_SECRET, REDIRECT_URI }))
.then(() => opn(auth.generateAuthUrl({ access_type: 'offline', scope: ['https://www.googleapis.com/auth/drive'] })))
.then(() => new Promise((resolve) => rl.question('Enter the code from that page here: ', resolve)))
.then(code => auth.getToken(code).then(({ tokens: { refresh_token } }) => refresh_token))
.then(REFRESH_TOKEN =>
  writeFile(
    '.env',
    Object
    .entries(Object.assign({}, dotenv.config().parsed, { REFRESH_TOKEN }))
    .map(([ key, value ]) => `${key}=${value}`)
    .join('\n')
  )
  .then(() =>
    console.log(`REFRESH_TOKEN: ${process.env.REFRESH_TOKEN} => ${REFRESH_TOKEN}`)
  )
)
.then(() => rl.close())
.catch(err => {
  rl.close()
  console.error(err)
  process.exit(1)
})
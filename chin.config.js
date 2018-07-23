import { inkscape, inkscapeMergePdfs } from 'chin-plugin-inkscape'
import { join, parse, format } from 'path'

const dpi = 192
const ign = { processor: () => undefined }

const whi = inkscape('png', { dpi, background: '#ffffff' })
const tra = inkscape('png', { dpi })
const pdf = inkscape('pdf')
const prt = inkscape('pdf', { area: 'drawing' })
const merges = dirs2merges({
  dirs: [
    'pamphlet',
    'window.recruit',
    'window.summer'
  ]
})
const printMerges = dirs2merges({
  options: { area: 'drawing' },
  dirs: [
    'pamphlet'
  ]
})

const configs = {
  /* png */
  'png:whi': { put: 'png', out: '.dist/png', processors: { svg: whi } },
  'png:tra': { put: 'png', out: '.dist/png/transparent', processors: { svg: tra } },
  'png': function() { return [ this['png:whi'], this['png:tra'] ] },

  /* both */
  'both:parm:png': { put: 'both.parm', out: '.dist/png', processors: { svg: whi } },
  'both:parm:pdf': { put: 'both.parm', out: '.dist/pdf', processors: { svg: pdf } },
  'both:temp:png': { put: 'both.temp', out: '.dist/png', processors: { svg: whi } },
  'both:temp:pdf': { put: 'both.temp', out: '.dist/pdf', processors: { svg: pdf } },
  'both:parm': function(){ return [ this['both:parm:png'], this['both:parm:pdf'] ] },
  'both:temp': function(){ return [ this['both:temp:png'], this['both:temp:pdf'] ] },
  'both': function() { return [].concat(this['both:parm'](), this['both:temp']()) },

  /* pdf */
  'pdf:doc': { put: 'pdf.doc', out: '.dist/pdf', processors: { svg: pdf } },
  'pdf:mrg': {
    put: 'pdf.mrg',
    out: '.dist/pdf',
    processors: merges,
    after: () =>
    Promise.all(merges.map(([ dir, { svg } ]) =>
      svg.after(
        `.dist/pdf/${dir}.pdf`,
        { sort: mergesSort }
      )
    ))
  },
  'pdf:prt': [
    { put: 'pdf.prt', out: '.dist/png', processors: { svg: whi } },
    { put: 'pdf.prt', out: '.dist/pdf', processors: { svg: pdf } },
    { put: 'pdf.prt', out: '.dist/pdf.raksul', processors: { svg: prt } },
    { put: 'pdf.mrg',
      out: '.dist/pdf.raksul',
      processors: [].concat(printMerges, [ ['*', { svg: ign }] ]),
      after: () =>
      Promise.all(printMerges.map(([ dir, { svg } ]) =>
        svg.after(
          `.dist/pdf.raksul/${dir}.pdf`,
          { sort: mergesSort }
        )
      ))
    }
  ],
  'pdf': function() { return [].concat( [ this['pdf:doc'], this['pdf:mrg'] ], this['pdf:prt']) },

  'ss': { put: '.noink/spreadsheet', out: '.dist/pdf' },

  /* all */
  'all': function() { return [].concat(this.png(), this.both(), this.pdf(), [ this['ss'] ]) }
}

const command = process.env.npm_lifecycle_event
const config = typeof configs[command] === 'function' ? configs[command]() : configs[command]
export default config


function dirs2merges({ prefix = './', options, dirs }) {
  return dirs.map(dir => [join(prefix, dir), { svg: inkscapeMergePdfs(options) }])
}

function parseXbase(filepath) {
  const { root, dir, name, ext } = parse(filepath)
  return { root, dir, name, ext }
}

function mergesSort(filepaths) {
  return (
    filepaths
    .map(parseXbase)
    .sort((a, b) => {
      const anum = +a.name
      const bnum = +b.name
      return (
        anum === NaN ? 1 :
        anum < bnum ? -1 :
        anum > bnum ? 1 :
        0
      )
    })
    .map(format)
  )
}
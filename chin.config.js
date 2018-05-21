import { inkscape, inkscapeMergePdfs } from 'chin-plugin-inkscape'
import { join, parse, format } from 'path'

const createMerges = ({ dir, options }) => dir.map(dirname => [dirname, inkscapeMergePdfs(options)])

const parseExBase = (filepath) => {
  const { root, dir, name, ext } = parse(filepath)
  return { root, dir, name, ext }
}

const sort = (filepaths) =>
  filepaths
  .map(parseExBase)
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

const put = 'source'
const out = '.dist'
const dpi = 192

const ink2white = inkscape('png', { dpi, background: '#ffffff' })

const ink2trans = inkscape('png', { dpi })

const ink2pdf = inkscape('pdf')

const ink2print = inkscape('pdf', { area: 'drawing' })

const dir2merges = createMerges({
  dir: [
    'pamphlet',
    'recruit',
    'summer'
  ]
})

const dir2printmerges = createMerges({
  dir: [
    'pamphlet'
  ],
  options: { area: 'drawing' }
})

const configs = {

  'white': {
    put: `${put}/png`,
    out: `${out}/png`,
    processors: { svg: ink2white }
  },

  'trans': {
    put: `${put}/png`,
    out: `${out}/png.trans`,
    clean: true,
    processors: { svg: ink2trans }
  },

  'both:g': {
    put: `${put}/both`,
    out: `${out}/png`,
    processors: { svg: ink2white }
  },

  'both:d': {
    put: `${put}/both`,
    out: `${out}/pdf`,
    processors: { svg: ink2pdf }
  },

  'pdf': {
    put: `${put}/pdf`,
    out: `${out}/pdf`,
    processors: [].concat(
      dir2merges.map(([dirname,ext]) => [`merge/${dirname}`, { svg: ext }]),
      [ ['*', { svg: ink2pdf }] ]
    ),
    after: () =>
      Promise.all(dir2merges.map(([dirname,ext]) =>
        ext.after(`${out}/pdf/${dirname}.pdf`)
      ))
  },

  'print': {
    put: `${put}/pdf`,
    out: `${out}/pdf.print`,
    clean: true,
    ignored: [
      `${put}/pdf/recruit.svg`,
      `${put}/pdf/term.svg`,
      `${put}/pdf/vaccination.svg`,
      `${put}/pdf/merge/recruit`,
      `${put}/pdf/merge/summer`
    ],
    processors: [].concat(
      dir2printmerges.map(([dirname,ext]) => [`merge/${dirname}`, { svg: ext }]),
      [ ['*', { svg: ink2print }] ]
    ),
    after: () =>
      Promise.all(
        dir2printmerges.map(([dirname,ext]) =>
          ext.after(`${out}/pdf.print/${dirname}.pdf`)
        )
      )
  },

  all() {
    return Object.values(this).filter(config => typeof config === 'object')
  }

}

const command = process.env.npm_lifecycle_event
const config = typeof configs[command] === 'function' ? configs[command]() : configs[command]
export default config
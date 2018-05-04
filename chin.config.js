import { inkscape, inkscapeMergePdfs } from 'chin-plugin-inkscape'
import { join, parse, format } from 'path'

const createMerges = (dirnames, opts) =>
  dirnames.map(dirname => [
    dirname,
    inkscapeMergePdfs(opts)
  ])

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

const pngWhiteExt = inkscape('png', { dpi, background: '#ffffff' })
const pngTransExt = inkscape('png', { dpi })
const pdfExt = inkscape('pdf')
const printExt = inkscape('pdf', { area: 'drawing' })

const merges = createMerges([
  'pamphlet',
  'recruit',
  'summer'
])

const printMerges = createMerges([
  'pamphlet'
],
{
  area: 'drawing'
})

const commands = process.env.CHIN_ENV.split(',')

export default [

  commands.includes('png') && {
    put: `${put}/png`,
    out: `${out}/png`,
    processors: { svg: pngWhiteExt }
  },

  commands.includes('png:trans') && {
    put: `${put}/png`,
    out: `${out}/png.trans`,
    clean: true,
    processors: { svg: pngTransExt }
  },

  commands.includes('both') && {
    put: `${put}/both`,
    out: `${out}/png`,
    processors: { svg: pngWhiteExt }
  },

  commands.includes('both:pdf') && {
    put: `${put}/both`,
    out: `${out}/pdf`,
    processors: { svg: pdfExt }
  },

  commands.includes('pdf') && {
    put: `${put}/pdf`,
    out: `${out}/pdf`,
    processors: [].concat(
      merges.map(([dirname,ext]) =>
        [`merge/${dirname}`, { svg: ext }]
      ),
      [ ['*', { svg: pdfExt }] ]
    ),
    after: () =>
      Promise.all(merges.map(([dirname,ext]) =>
        ext.after(`${out}/pdf/${dirname}.pdf`)
      ))
  },

  commands.includes('print') && {
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
      printMerges.map(([dirname,ext]) =>
        [`merge/${dirname}`, { svg: ext }]
      ),
      [ ['*', { svg: printExt }] ]
    ),
    after: () =>
      Promise.all(
        printMerges.map(([dirname,ext]) =>
          ext.after(`${out}/pdf.print/${dirname}.pdf`)
        )
      )
  }

].filter(config => config)
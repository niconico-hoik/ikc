import { inkscape, inkscapePdfMerge } from 'chin-plugin-inkscape'
import { join, parse, format } from 'path'

const put = 'source'
const out = '.dist'
const dpi = 192

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

const configs = {

  'PNG': (query) => Object.assign(
    { put: `${put}/png` },
    query === 'TRANS'
    ? {
      out: `${out}/png.trans`,
      clean: true,
      processors: { svg: inkscape('png', { dpi }) }
    }
    : {
      out: `${out}/png`,
      processors: { svg: inkscape('png', { dpi, background: '#ffffff' }) }
    }
  ),

  'BOTH': (query) => Object.assign(
    { put: `${put}/both` },
    query === 'PDF'
    ? {
      out: `${out}/pdf`,
      processors: { svg: inkscape('pdf', { dpi })}
    }
    : {
      out: `${out}/png`,
      processors: { svg: inkscape('png', { dpi, background: '#ffffff' }) }
    }
  ),

  'PDF': () => {

    const putdir = `${put}/pdf`
    const outdir = `${out}/pdf`

    const merges = [
      'pamphlet',
      'recruit',
      'summer'
    ]
    .map(dirname => {
      const { ext, dist } = inkscapePdfMerge()
      const tuple = [`merge/${dirname}`, { svg: ext }]
      const after = () => dist(`${outdir}/${dirname}.pdf`, { sort })
      return { tuple, after }
    })

    const processors = [].concat(
      merges.map(({ tuple }) => tuple),
      [['', { svg: inkscape('pdf') }]]
    )

    const after = () => Promise.all(
      merges.map(({ after }) => after())
    )

    return { put: putdir, out: outdir, processors, after }
  },

  'PRINT': () => {

    const area = 'drawing'
    const pdfdir = `${put}/pdf`
    const outdir = `${out}/pdf.print`

    const merges = [
      'pamphlet'
    ]
    .map(dirname => {
      const { ext, dist } = inkscapePdfMerge({ area })
      const tuple = [`merge/${dirname}`, { svg: ext }]
      const after = () => dist(`${outdir}/${dirname}.pdf`, { sort })
      return { tuple, after }
    })

    const ignored = [
      `${pdfdir}/recruit.svg`,
      `${pdfdir}/term.svg`,
      `${pdfdir}/vaccination.svg`,
      `${pdfdir}/merge/recruit`,
      `${pdfdir}/merge/summer`
    ]
    .filter(dirpath =>
      !merges.some(({ tuple: [path] }) => dirpath.includes(path))
    )

    const processors = [].concat(
      merges.map(({ tuple }) => tuple),
      [['.', { svg: inkscape('pdf', { area }) }]]
    )

    const after = () => Promise.all(
      merges.map(({ after }) => after())
    )

    return { put: pdfdir, out: outdir, clean: true, ignored, processors, after }
  }

}

const [key, queries] = process.env.CHIN_ENV.split(':')

export default Object.assign(
  { put, out },
  configs[key](...(!queries ? [] : queries.split('&')))
)
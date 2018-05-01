import { inkscape, inkscapePdfMerge } from 'chin-plugin-inkscape'
import { join } from 'path'
import { putbase, outbase, sort } from './util.js'

const format = 'pdf'
const area = 'drawing'

const put = join(putbase, format)
const out = join(outbase, 'print')
const ignored = [
  `${put}/**.svg`,
  `${put}/merge/recruit`,
  `${put}/merge/summer`
]

const mergeWithPrint = inkscapePdfMerge({ area })

const processors = [
  ['merge/pamphlet', { svg: mergeWithPrint.ext }],
  ['printable', { svg: inkscape(format, { area }) }]
]

const after = () => mergeWithPrint.dist(join(out, 'printable', `pamphlet.${format}`))

export default { put, out, clean: true, ignored, processors, after }
import { inkscape, inkscapePdfMerge } from 'chin-plugin-inkscape'
import { join } from 'path'
import { putbase, outbase, sort } from './util.js'

const format = 'pdf'
const put = join(putbase, format)
const out = join(outbase, format)
const ignored = []

const merges = [
  'pamphlet',
  'recruit',
  'summer'
]
.map(dirname =>
  Object.assign(
    { dirname },
    inkscapePdfMerge()
  )
)
.map(({ dirname, ext, dist }) => ({
  processors: [join('merge', dirname), { svg: ext }],
  after: () => dist(join(out, 'merge', `${dirname}.pdf`), { sort })
}))

const processors = [].concat(
  merges.map(({ processors }) => processors),
  [['', { svg: inkscape('pdf') }]]
)

const after = () => Promise.all(merges.map(({ after }) => after()))

export default { put, out, clean: true, ignored, processors, after }
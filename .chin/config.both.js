import inkscape from 'chin-plugin-inkscape'
import { join } from 'path'
import { putbase, outbase } from './util.js'

const base = 'both'

const config = (format) => ({
  put: join(putbase, base),
  out: join(outbase, base, format),
  clean: true,
  ignored: [],
  processors: {
    svg: inkscape(format, {
      dpi: 192,
      background: '#ffffff'
    })
  }
})

export default config(process.env.CHIN_ENV === 'PDF' ? 'pdf' : 'png')
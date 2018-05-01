import inkscape from 'chin-plugin-inkscape'
import { join } from 'path'
import { putbase, outbase } from './util.js'

const format = 'png'

const config = ({ outjoined, background }) => ({
  put: join(putbase, format),
  out: join(outbase, format, outjoined),
  clean: true,
  ignored: [],
  processors: {
    svg: inkscape(format, {
      dpi: 192,
      background: '#ffffff'
    })
  }
})

export default config(
  process.env.CHIN_ENV === 'WHITE'
  ? { outjoined: 'white', background: '#ffffff' }
  : { outjoined: 'trans' }
)
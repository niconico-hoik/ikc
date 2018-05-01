import { parse, format } from 'path'

export const putbase = 'source'
export const outbase = '.dist'

const parseExBase = (filepath) => {
  const { root, dir, name, ext } = parse(filepath)
  return { root, dir, name, ext }
}

export const sort = (filepaths) =>
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
const throws = (message) => { throw new Error(message) }

const assertsObj = (obj) =>
  Object
  .entries(obj)
  .forEach(([ key, value ]) =>
    !value &&
    throws(`${key} is undefined`)
  )

module.exports = { throws, assertsObj }
export const removeNumberFromArray = (array, key) => {
  if (!array.includes(key)) { return }
  return array.splice(array.indexOf(key), 1)
}

export const removeNumbersFromArray = (array, keys) => {
  keys.forEach((key) => {
    array = removeNumberFromArray(array, key)
  })
  return array
}

export const getItemFromArray = (array, key) => {
  if (!array.includes(key)) { return false }
  return array[array.indexOf(key)]
}

export const getItemByFieldFromArray = (field, array, key) => {
  const tmp = array.map(item => item[field])
  if (!tmp.includes(key)) { return false }
  return array[tmp.indexOf(key)]
}

export const removeItemByFieldFromArray = (field, array, key) => {
  const tmp = array.map(item => item[field])
  if (!tmp.includes(key)) { return array }
  array.splice(tmp.indexOf(key), 1)
  return array
}

export const removeItemsByFieldFromArray = (field, array, keys) => {
  keys.forEach((key) => {
    array = removeItemByFieldFromArray(field, array, key)
  })
  return array
}

export function currency (value) {
  if (typeof value !== 'number') {
    return value
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })
  return formatter.format(value)
}

export function upperFirst (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

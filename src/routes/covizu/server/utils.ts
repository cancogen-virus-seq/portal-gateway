// @ts-nocheck
// from covizu team

// This is a hack to match anything that could be an acc number prefix
const prefix = /^(E|I|EP|IS|EPI_I|EPI_IS|EPI_ISL_?|EPI_?|ISL_?|[A-Z]\.[1-9]+)$/i;
const MIN_RESULTS = 10;
const normalize = (str: string) => str.replace(/[^a-z0-9]/gi, '').toLowerCase();

/**
 * Returns unique elements in given array.
 * @param {Array} arr
 * @returns {string[]}
 */
const unique = (arr: any[]) => {
  var key,
    history = {};
  for (var i = 0; i < arr.length; i++) {
    key = arr[i];
    if (history[key] === undefined) {
      history[key] = 1;
    }
  }
  return Object.keys(history);
};

/**
 * Returns most common element of array.  If there is a tie, then
 * the function returns the right-most value.
 * @param {Array} arr:  array of elements to sort
 * @return most common element
 */
const mode = (arr: any[]) => {
  if (arr.length === 0) {
    return undefined;
  }
  var counts = {},
    key,
    max_key = arr[0],
    max_count = 1;
  for (var i = 0; i < arr.length; i++) {
    key = arr[i];
    if (counts[key] == null) {
      counts[key] = 1;
      continue;
    }
    counts[key]++;
    if (counts[key] > max_count) {
      max_count = counts[key];
      max_key = key;
    }
  }
  return max_key;
};

/**
 * Tabulate values in array.
 * @param {Array} arr:  Array of values to tabulate
 * @returns {{}} Associative list of unique value: count pairs
 */
const tabulate = (arr: any[]) => {
  var val,
    counts = {};
  for (var i = 0; i < arr.length; i++) {
    val = arr[i];
    if (val === null) {
      continue;
    }
    if (counts[val] === undefined) {
      counts[val] = 0;
    }
    counts[val]++;
  }
  return counts;
};

/**
 *
 */
const merge_tables = (tables: any[]) => {
  var total = {};
  for (let tab of tables) {
    if (tab === null) {
      continue;
    }
    for (let key of Object.keys(tab)) {
      if (total[key] === undefined) {
        total[key] = 0;
      }
      total[key] += tab[key];
    }
  }
  return total;
};

/**
 * Returns a date in UTC
 *
 * @param {String} date: The date to be converted
 */
function utcDate(date: string) {
  const dateObj = new Date(date);
  return new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
}

export { merge_tables, MIN_RESULTS, mode, normalize, prefix, tabulate, unique, utcDate };

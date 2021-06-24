const XDate = require('xdate');

function padNumber(n) {
  if (n < 10) {
    return '0' + n;
  }
  return n;
}

function xdateToData(d) {
  const dateString = toMarkingFormat(d);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    timestamp: XDate(dateString, true).getTime(),
    dateString: dateString,
    dayNameIndex: d.getDay()
  };
}

function parseDate(d) {
  if (!d) {
    return;
  } else if (d.timestamp) {
    // conventional data timestamp
    return XDate(d.timestamp, true);
  } else if (d instanceof XDate) {
    // xdate
    return XDate(toMarkingFormat(d), true);
  } else if (d.getTime) {
    // javascript date
    const dateString = d.getFullYear() + '-' + padNumber(d.getMonth() + 1) + '-' + padNumber(d.getDate());
    return XDate(dateString, true);
  } else if (d.year) {
    const dateString = d.year + '-' + padNumber(d.month) + '-' + padNumber(d.day);
    return XDate(dateString, true);
  } else if (d) {
    // timestamp number or date formatted as string
    return XDate(d, true);
  }
}

function toMarkingFormat(d) {
  return d instanceof XDate && d.toString('yyyy-MM-dd');
}

module.exports = {
  xdateToData,
  parseDate,
  toMarkingFormat
};

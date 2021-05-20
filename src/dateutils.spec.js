const XDate = require('xdate');
const dateutils = require('./dateutils');

describe('dateutils', function () {
  describe('sameMonth()', function () {
    it('2014-01-01 === 2014-01-10', function () {
      const a = XDate(2014, 0, 1, true);
      const b = XDate(2014, 0, 10, true);
      expect(dateutils.sameMonth(a, b)).toEqual(true);
    });
    it('for non-XDate instances is false', function () {
      expect(dateutils.sameMonth('a', 'b')).toEqual(false);
      expect(dateutils.sameMonth(123, 345)).toEqual(false);
      expect(dateutils.sameMonth(null, false)).toEqual(false);

      const a = XDate(2014, 0, 1, true);
      const b = XDate(2014, 0, 10, true);
      expect(dateutils.sameMonth(a, undefined)).toEqual(false);
      expect(dateutils.sameMonth(null, b)).toEqual(false);
    });
  });

  describe('isLTE()', function () {
    it('2014-01-20 >= 2013-12-31', function () {
      const a = XDate(2013, 12, 31);
      const b = XDate(2014, 1, 20);
      expect(dateutils.isLTE(a, b)).toBe(true);
    });

    it('2014-10-20 >= 2014-10-19', function () {
      const a = XDate(2014, 10, 19);
      const b = XDate(2014, 10, 20);
      expect(dateutils.isLTE(a, b)).toBe(true);
    });

    it('2014-10-20 >= 2014-09-30', function () {
      const a = XDate(2014, 9, 30);
      const b = XDate(2014, 10, 20);
      expect(dateutils.isLTE(a, b)).toBe(true);
    });

    it('works for dates that differ by less than a day', function () {
      const a = XDate(2014, 9, 30, 0, 1, 0);
      const b = XDate(2014, 9, 30, 1, 0, 1);
      expect(dateutils.isLTE(a, b)).toBe(true);
      expect(dateutils.isLTE(b, a)).toBe(true);
    });
  });

  describe('formatStringNumbers()', function () {
    it('should format numbers in a string', function () {
      const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
      expect(dateutils.formatStringNumbers("December 2020", arabicNumbers)).toEqual("December ٢٠٢٠");
    });

    it('should return the original string if numbers are not defined', function () {
      const text = "December 2020";
      expect(dateutils.formatStringNumbers(text)).toEqual(text);
    });
  });

  describe('isGTE()', function () {
    it('2014-01-20 >= 2013-12-31', function () {
      const a = XDate(2013, 12, 31);
      const b = XDate(2014, 1, 20);
      expect(dateutils.isGTE(b, a)).toBe(true);
    });

    it('2014-10-20 >= 2014-10-19', function () {
      const a = XDate(2014, 10, 19);
      const b = XDate(2014, 10, 20);
      expect(dateutils.isGTE(b, a)).toBe(true);
    });

    it('2014-10-20 >= 2014-09-30', function () {
      const a = XDate(2014, 9, 30);
      const b = XDate(2014, 10, 20);
      expect(dateutils.isGTE(b, a)).toBe(true);
    });

    it('works for dates that differ by less than a day', function () {
      const a = XDate(2014, 9, 30, 0, 1, 0);
      const b = XDate(2014, 9, 30, 1, 0, 1);
      expect(dateutils.isGTE(a, b)).toBe(true);
      expect(dateutils.isGTE(b, a)).toBe(true);
    });
  });

  describe('month()', function () {
    it('2014 May', function () {
      const days = dateutils.month(XDate(2014, 4, 1));
      expect(days.length).toBe(31);
    });

    it('2014 August', function () {
      const days = dateutils.month(XDate(2014, 7, 1));
      expect(days.length).toBe(31);
    });
  });

  describe('page()', function () {
    it('2014 March', function () {
      const days = dateutils.page(XDate(2014, 2, 23, true));
      expect(days.length).toBe(42);
      expect(days[0].toString())
        .toBe(XDate(2014, 1, 23, 0, 0, 0, true).toString());
      expect(days[days.length - 1].toString())
        .toBe(XDate(2014, 3, 5, 0, 0, 0, true).toString());
    });

    it('2014 May', function () {
      const days = dateutils.page(XDate(2014, 4, 23));
      expect(days.length).toBe(35);
    });

    it('2014 June', function () {
      const days = dateutils.page(XDate(2014, 5, 23));
      expect(days.length).toBe(35);
    });

    it('2014 August', function () {
      const days = dateutils.page(XDate(2014, 7, 23));
      expect(days.length).toBe(42);
    });

    it('2014 October', function () {
      const days = dateutils.page(XDate(2014, 9, 21));
      expect(days.length).toBe(35);
    });

    it('has all days in ascending order', function () {
      let days, i, len;

      days = dateutils.page(XDate(2014, 2, 1));
      for (i = 0, len = days.length - 1; i < len; i++) {
        expect(days[i].diffDays(days[i + 1])).toBe(1);
      }
      days = dateutils.page(XDate(2014, 9, 1));
      for (i = 0, len = days.length - 1; i < len; i++) {
        expect(days[i].diffDays(days[i + 1])).toBe(1);
      }
    });
  });

});

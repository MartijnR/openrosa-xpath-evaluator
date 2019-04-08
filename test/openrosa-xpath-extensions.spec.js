const or = openrosa_xpath_extensions;

var f = or(translate).func;

function zeroPad(n) {
  return n >= 10 ? n : '0' + n;
}

function simpleDateString(d) {
  return d.getFullYear() + '-' + zeroPad(d.getMonth()+1) + '-' + zeroPad(d.getDate());
}

describe('#count-selected()', function() {
  _.forEach({
    '': 0,
    '    ': 0,
    'one': 1,
    ' one   ': 1,
    'one two': 2,
    'one two three': 3,
    'one  two  three': 3,
    'one-1  two,2  three==3': 3,
  }, function(expected, v) {
    it(`should return ${expected} when called with <<${v}>>`, function() {
      // given
      const r = { t:'str', v };

      // when
      var result = f['count-selected'](r);

      // then
      assert.equal(result.v, expected);
    });
  });
});

describe('#date()', function() {
  describe('when called with integers', function() {
    it('should return a date type', function() {
      // given
      const r = { t:'str', v:0 };

      // expect
      assert.equal(f.date(r).t, 'date');
    });
    it('should return a value of type Date', function() {
      // given
      const r = { t:'str', v:0 };

      // expect
      assert.ok(f.date(r).v instanceof Date);
    });

    _.forEach({
      '1969-12-31': -1,
      '1970-01-01': 0,
      '1970-01-02': 1,
      '1971-02-05': 400,
    }, function(v, expected) {
      // given
      const r = { t:'str', v };

      it('should convert ' + r + ' to ' + expected, function() {
        // expect
        assert.equal(simpleDateString(f.date(r).v), expected);
      });
    });
  });

  describe('when called with floats', function() {
    it('should return a date type', function() {
      // given
      const r = { t:'num', v:1.11596 };

      // expect
      assert.equal(f.date(r).t, 'date');
    });
    it('should return a value of type Date', function() {
      // given
      const r = { t:'num', v:1.11596 };

      // expect
      assert.ok(f.date(r).v instanceof Date);
    });

    _.forEach({
      '1969-12-31': -1.234567,
      '1970-01-01': 0.0001,
      '1970-01-02': 1.99999,
      '1971-02-05': 400.5,
    }, function(v, expected) {
      // given
      const r = { t:'num', v };

      it('should convert ' + r + ' to ' + expected, function() {
        // expect
        assert.equal(simpleDateString(f.date(r).v), expected);
      });
    });
  });

  describe('when called with valid strings', function() {
    _.forEach([
      '1969-12-31',
      '1970-01-01',
      '1970-01-02',
      '1971-02-05',
    ], function(v) {
      // given
      const r = { t:'str', v };

      it('should return a date type', function() {
        // expect
        assert.equal(f.date(r).t, 'date');
      });
      it('should return a value of type Date', function() {
        // expect
        assert.ok(f.date(r).v instanceof Date);
      });
      it('should return the correct date, in the local format', function() {
        // expect
        assert.equal(simpleDateString(f.date(r).v), r.v);
      });
    });
  });

  it('supports overriding current time', () => {
    const extensions = or(translate);
    extensions._now = function() { return new Date('2000-01-01'); };
    const actual = extensions.func.now();
    assert.equal(actual.t, 'date');
    assert.include(actual.v.toISOString(), '2000-01-01');
  });

  describe('when called with invalid strings', function() {
    _.forEach([
        'nonsense',
        '99-12-31',
    ], function(v) {
      // given
      const r = { t:'string', v };

      it('should return a string type', function() {
        // expect
        assert.equal(f.date(r).t, 'str');
      });
      it(`should convert "${v}" to "Invalid Date"`, function() {
        // expect
        assert.equal(f.date(r).v, 'Invalid Date');
      });
    });
  });
});

describe('#date-format()', function() {
  it("should return empty string if it can't parse a date", function() {
    // given
    const badDateString = { type:'str', v:'abc' };
    const format = { type:'str', v:'%Y' };

    // when
    const formattedDate = f['format-date'](badDateString, format);

    // then
    assert.equal(formattedDate.v, '');
  });
});

describe('#now()', function() {
  it('should return a result of type `date`', function() {
    assert.equal(f.now().t, 'date');
  });

  it('should return a value which is instance of Date', function() {
    assert.ok(f.now().v instanceof Date);
  });
});

describe('#today()', function() {
  it('should return a result of type `date`', function() {
    assert.equal(f.today().t, 'date');
  });

  it('should return a value which is instance of Date', function() {
    assert.ok(f.today().v instanceof Date);
  });
});

describe('#now() and #today()', function() {
  it('should have the same implementation', function() {
    assert.equal(f.today, f.now);
    assert.equal(f.now, f.today);
  });
});

describe('medic mobile extensions', function() {
  // TODO these should NOT be in here - please move them to a separate
  // extensions file

  describe('#difference-in-months', function() {
    [
      [ "2015-10-01", "2015-10-01", 0, ],
      [ "2015-09-01", "2015-10-01", 1, ],
      [ "2015-09-02", "2015-10-01", 0, ],
      [ "2015-10-01", "2015-11-01", 1, ],
      [ "2015-10-02", "2015-11-01", 0, ],
      [ "2014-10-01", "2015-10-01", 12, ],
      [ "2014-10-02", "2015-10-01", 11, ],
      [ "2015-10-01", "2014-10-01", -12, ],
    ].forEach(function(example) {
      var d1 = { t:'str', v:example[0] },
          d2 = { t:'str', v:example[1] },
          expectedDifference = example[2];

      it('should report difference between ' + d1 + ' and ' + d2 + ' as ' + expectedDifference, function() {
        assert.equal(f['difference-in-months'](d1, d2).v, expectedDifference);
      });
    });

    it('should return an empty string when the difference cannot be calculated', function() {
      // given
      const d1 = { t:'str', v:'nonsense' };
      const d2 = { t:'str', v:'2015-09-22' };

      // expect
      assert.equal(f['difference-in-months'](d1, d2).v, '');
    });
  });
});

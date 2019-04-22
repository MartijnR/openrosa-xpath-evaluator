describe('#round()', () => {
  describe('with a single argument', () => {
    _.forEach({
      '1': 1,
      '1.1': 1,
      '1.5': 2,
      '-1': -1,
      '-1.1': -1,
      '-1.5': -2,
    }, function(expected, input) {
      // when
      var expr = 'round("{1}")'
          .replace('{1}', input);

      it('should evaluate ' + expr + ' to ' + expected, () => {
        // expect
        assertNumber(expr, expected);
      });
    });
  });

  describe('with two arguments', () => {
    describe('with num_digits = 0', () => {
      _.forEach({
        '1': 1,
        '1.1': 1,
        '1.5': 2,
        '-1': -1,
        '-1.1': -1,
        '-1.5': -2,
      }, function(expected, input) {
        // given
        var expr = 'round("{1}", "0")'
            .replace('{1}', input);

        it('should evaluate ' + expr + ' to ' + expected, () => {
          // expect
          assertNumber(expr, expected);
        });
      });
    });

    describe('with num_digits > 0', () => {
      _.forEach([
        [ '0', 1, '0' ],
        [ '1', 1, '1' ],
        [ '1', 2, '1' ],
        [ '23.7825', 2, '23.78' ],
        [ '23.7825', 1, '23.8' ],
        [ '2.15', 1, '2.2' ],
        [ '2.149', 1, '2.1' ],
        [ '-1.475', 2, '-1.48' ],
      ], function(data) {
        // given
        var number = data[0];
        var numDigits = data[1];
        var expected = data[2];

        // and
        var expr = 'round("{1}", "{2}")'
            .replace('{1}', number)
            .replace('{2}', numDigits);

        it('should evaluate ' + expr + ' to ' + expected, () => {
          // when
          var res = xEval(expr);

          // then
          assert.equal(res.resultType, XPathResult.NUMBER_TYPE);
          assert.equal(res.stringValue, expected);
        });
      });
    });

    describe('with num_digits < 0', () => {
      _.forEach([
        [ '0', -1, 0 ],
        [ '1', -1, 0 ],
        [ '1', -2, 0 ],
        [ '23.7825', -2, 0 ],
        [ '23.7825', -1, 20 ],
        [ '2.15', -1, 0 ],
        [ '2.149', -1, 0 ],
        [ '-1.475', -2, 0 ],
        [ '21.5', -1, 20 ],
        [ '626.3', -3, 1000 ],
        [ '1.98', -1, 0 ],
        [ '-50.55', -2, -100 ],
      ], function(data) {
        // given
        var number = data[0];
        var numDigits = data[1];
        var expected = data[2];

        // and
        var expr = 'round("{1}", "{2}")'
            .replace('{1}', number)
            .replace('{2}', numDigits);

        it('should evaluate ' + expr + ' to ' + expected, () => {
          // when
          var res = xEval(expr);

          // then
          assert.equal(res.resultType, XPathResult.NUMBER_TYPE);
          assert.equal(res.stringValue, expected);
        });
      });
    });
  });
});

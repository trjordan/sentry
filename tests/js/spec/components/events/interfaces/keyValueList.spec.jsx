import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import KeyValueList from 'app/components/events/interfaces/keyValueList';

describe('KeyValueList', function () {
  describe('render', function () {
    it('should render a definition list of key/value pairs', function () {
      const data = [
        {key: 'a', value: 'x', subject: 'a'},
        {key: 'b', value: 'y', subject: 'b'},
      ];
      const {container} = renderWithTheme(<KeyValueList data={data} />);

      const keys = container.querySelectorAll('td.key');
      const vals = container.querySelectorAll('td.val');

      expect(keys[0].textContent).toEqual('a');
      expect(keys[1].textContent).toEqual('b');

      expect(vals[0].textContent).toEqual('x');
      expect(vals[1].textContent).toEqual('y');
    });

    it('should sort sort key/value pairs', function () {
      const data = [
        {key: 'b', value: 'y', subject: 'b'},
        {key: 'a', value: 'x', subject: 'a'},
      ];
      const {container} = renderWithTheme(<KeyValueList data={data} />);

      const keys = container.querySelectorAll('td.key');
      const vals = container.querySelectorAll('td.val');

      expect(keys[0].textContent).toEqual('a');
      expect(keys[1].textContent).toEqual('b');

      expect(vals[0].textContent).toEqual('x');
      expect(vals[1].textContent).toEqual('y');
    });

    it('should use a single space for values that are an empty string', function () {
      const data = [
        {key: 'b', value: 'y', subject: 'b'},
        {key: 'a', value: '', subject: 'a'}, // empty string
      ];
      const {container} = renderWithTheme(<KeyValueList data={data} />);

      const keys = container.querySelectorAll('td.key');
      const vals = container.querySelectorAll('td.val');

      expect(keys[0].textContent).toEqual('a');
      expect(keys[1].textContent).toEqual('b');

      expect(vals[0].textContent).toEqual('');
      expect(vals[1].textContent).toEqual('y');
    });

    it('can sort key/value pairs with non-string values', function () {
      const data = [
        {key: 'b', value: {foo: 'bar'}, subject: 'b'},
        {key: 'a', value: [3, 2, 1], subject: 'a'},
      ];
      const {container} = renderWithTheme(<KeyValueList isContextData data={data} />);

      const keys = container.querySelectorAll('td.key');

      // Ignore values, more interested in if keys rendered + are sorted
      expect(keys[0].textContent).toEqual('a');
      expect(keys[1].textContent).toEqual('b');
    });

    it('should coerce non-strings into strings', function () {
      const data = [{key: 'a', value: false, subject: 'a'}];
      const {container} = renderWithTheme(<KeyValueList data={data} />);

      const keys = container.querySelectorAll('td.key');
      const vals = container.querySelectorAll('td.val');

      expect(keys[0].textContent).toEqual('a');
      expect(vals[0].textContent).toEqual('false');
    });

    it("shouldn't blow up on null", function () {
      const data = [{key: 'a', value: null, subject: 'a'}];
      const {container} = renderWithTheme(<KeyValueList data={data} />);

      const keys = container.querySelectorAll('td.key');
      const vals = container.querySelectorAll('td.val');

      expect(keys[0].textContent).toEqual('a');
      expect(vals[0].textContent).toEqual('null');
    });
  });
});

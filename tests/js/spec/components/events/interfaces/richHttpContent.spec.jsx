import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import RichHttpContent from 'app/components/events/interfaces/richHttpContent/richHttpContent';

describe('RichHttpContent', function () {
  let data;

  afterEach(function () {});

  describe('getBodySection', function () {
    it('should return plain-text when given unrecognized inferred Content-Type', function () {
      data = {
        query: '',
        data: 'helloworld',
        headers: [],
        cookies: [],
        env: {},
        inferredContentType: null,
      };
      const {container} = renderWithTheme(<RichHttpContent data={data} />);
      expect(
        container.querySelector('[data-test-id="rich-http-content-body-section-pre"]')
      ).toBeInTheDocument();
    });

    it('should return a KeyValueList element when inferred Content-Type is x-www-form-urlencoded', function () {
      data = {
        query: '',
        data: {foo: ['bar'], bar: ['baz']},
        headers: [],
        cookies: [],
        env: {},
        inferredContentType: 'application/x-www-form-urlencoded',
      };
      const {container} = renderWithTheme(<RichHttpContent data={data} />);
      // KeyValueList renders as a table with key/value cells
      expect(container.querySelector('table.key-value')).toBeInTheDocument();
      const keys = container.querySelectorAll('td.key');
      expect(keys.length).toBeGreaterThan(0);
    });

    it('should return a ContextData element when inferred Content-Type is application/json', function () {
      data = {
        query: '',
        data: {foo: 'bar'},
        headers: [],
        cookies: [],
        env: {},
        inferredContentType: 'application/json',
      };
      const {container} = renderWithTheme(<RichHttpContent data={data} />);
      expect(
        container.querySelector('[data-test-id="rich-http-content-body-context-data"]')
      ).toBeInTheDocument();
    });

    it('should not blow up in a malformed uri', function () {
      // > decodeURIComponent('a%AFc')
      // URIError: URI malformed
      data = {
        query: 'a%AFc',
        data: '',
        headers: [],
        cookies: [],
        env: {},
      };
      expect(() => renderWithTheme(<RichHttpContent data={data} />)).not.toThrow(
        URIError
      );
    });

    it("should not cause an invariant violation if data.data isn't a string", function () {
      data = {
        query: '',
        data: [{foo: 'bar', baz: 1}],
        headers: [],
        cookies: [],
        env: {},
      };

      expect(() => renderWithTheme(<RichHttpContent data={data} />)).not.toThrow();
    });
  });
});

import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {EmailField, Form} from 'app/components/forms';

describe('EmailField', function () {
  describe('render()', function () {
    it('renders', function () {
      const {container} = renderWithTheme(<EmailField name="fieldName" />);
      expect(container).toSnapshot();
    });

    it('renders with value', function () {
      const {container} = renderWithTheme(
        <EmailField name="fieldName" value="foo@example.com" />
      );
      expect(container).toSnapshot();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: 'foo@example.com'}}>
          <EmailField name="fieldName" />
        </Form>
      );
      expect(container).toSnapshot();
    });
  });
});

import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {Form, PasswordField} from 'app/components/forms';

describe('PasswordField', function () {
  describe('render()', function () {
    it('renders', function () {
      const {container} = renderWithTheme(<PasswordField name="fieldName" />);
      expect(container).toSnapshot();
    });

    it('renders with value', function () {
      const {container} = renderWithTheme(
        <PasswordField name="fieldName" value="foobar" />
      );
      expect(container).toSnapshot();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: 'foobar'}}>
          <PasswordField name="fieldName" />
        </Form>
      );
      expect(container).toSnapshot();
    });
  });
});

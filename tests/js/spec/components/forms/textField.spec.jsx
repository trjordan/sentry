import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {Form, TextField} from 'app/components/forms';

describe('TextField', function () {
  describe('render()', function () {
    it('renders without form context', function () {
      const {container} = renderWithTheme(<TextField name="fieldName" />);
      expect(container).toSnapshot();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: 'fieldValue'}}>
          <TextField name="fieldName" />
        </Form>
      );
      expect(container).toSnapshot();
    });
  });
});

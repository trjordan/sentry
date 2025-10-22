import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {Form, MultipleCheckboxField} from 'app/components/forms';

describe('MultipleCheckboxField', function () {
  describe('render()', function () {
    it('renders without form context', function () {
      const {container} = renderWithTheme(
        <MultipleCheckboxField
          name="fieldName"
          choices={[
            ['1', 'On'],
            ['2', 'Off'],
          ]}
          value={['1']}
        />
      );
      expect(container).toSnapshot();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: ['1']}}>
          <MultipleCheckboxField
            name="fieldName"
            choices={[
              ['1', 'On'],
              ['2', 'Off'],
            ]}
          />
        </Form>
      );
      expect(container).toSnapshot();
    });
  });
});

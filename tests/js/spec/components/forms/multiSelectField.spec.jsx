import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {Form, MultiSelectField} from 'app/components/forms';

describe('MultiSelectField', function () {
  describe('render()', function () {
    it('renders without form context', function () {
      const {container} = renderWithTheme(
        <MultiSelectField
          options={[
            {label: 'a', value: 'a'},
            {label: 'b', value: 'b'},
          ]}
          name="fieldName"
        />
      );
      // Check that the component renders
      expect(container.querySelector('#id-fieldName')).toBeInTheDocument();
    });

    it('has the right value from props', function () {
      renderWithTheme(
        <form aria-label="Test Form">
          <MultiSelectField
            options={[
              {label: 'a', value: 'a'},
              {label: 'b', value: 'b'},
            ]}
            name="fieldName"
            value={['a']}
          />
        </form>
      );
      // For multi-select, the form should contain the single selected value
      expect(screen.getByRole('form')).toHaveFormValues({fieldName: 'a'});
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: ['a', 'b']}} aria-label="Multi Form">
          <MultiSelectField
            options={[
              {label: 'a', value: 'a'},
              {label: 'b', value: 'b'},
            ]}
            name="fieldName"
          />
        </Form>
      );

      // For multi-select with multiple values, there should be multiple hidden inputs
      const inputs = container.querySelectorAll('[name="fieldName"]');
      expect(inputs).toHaveLength(2);
      expect(inputs[0]).toHaveValue('a');
      expect(inputs[1]).toHaveValue('b');
    });
  });
});

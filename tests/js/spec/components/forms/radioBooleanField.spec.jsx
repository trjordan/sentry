import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {RadioBooleanField} from 'app/components/forms';
import Form from 'app/components/forms/form';
import NewRadioBooleanField from 'app/views/settings/components/forms/radioBooleanField';

describe('RadioBooleanField', function () {
  describe('render()', function () {
    it('renders without form context', function () {
      const {container} = renderWithTheme(
        <RadioBooleanField name="fieldName" yesLabel="Yes" noLabel="No" />
      );
      expect(container.querySelector('input[value="true"]')).toBeInTheDocument();
      expect(container.querySelector('input[value="false"]')).toBeInTheDocument();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: true}}>
          <RadioBooleanField name="fieldName" yesLabel="Yes" noLabel="No" />
        </Form>
      );
      const trueInput = container.querySelector('input[value="true"]');
      expect(trueInput).toBeChecked();
    });

    it('renders new field without form context', function () {
      const {container} = renderWithTheme(
        <NewRadioBooleanField name="fieldName" yesLabel="Yes" noLabel="No" />
      );
      expect(container.querySelector('input[value="true"]')).toBeInTheDocument();
      expect(container.querySelector('input[value="false"]')).toBeInTheDocument();
    });

    it('can change values', function () {
      const mock = jest.fn();
      const {container} = renderWithTheme(
        <NewRadioBooleanField
          onChange={mock}
          name="fieldName"
          yesLabel="Yes"
          noLabel="No"
        />
      );

      const trueInput = container.querySelector('input[value="true"]');
      const falseInput = container.querySelector('input[value="false"]');

      trueInput?.click();
      expect(mock).toHaveBeenCalledWith(true, expect.anything());

      falseInput?.click();
      expect(mock).toHaveBeenCalledWith(false, expect.anything());
    });
  });
});

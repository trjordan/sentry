import React from 'react';

import {fireEvent, renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {NumberField} from 'app/components/forms';
import Form from 'app/components/forms/form';

describe('NumberField', function () {
  describe('render()', function () {
    it('renders', function () {
      const {container} = renderWithTheme(<NumberField name="fieldName" />);
      expect(container).toSnapshot();
    });

    it('renders with optional attributes', function () {
      const {container} = renderWithTheme(
        <NumberField name="fieldName" min={0} max={100} />
      );
      expect(container).toSnapshot();
    });

    it('renders with value', function () {
      const {container} = renderWithTheme(<NumberField name="fieldName" value={5} />);
      expect(container).toSnapshot();
    });

    it('renders with form context', function () {
      const {container} = renderWithTheme(
        <Form initialData={{fieldName: 5}}>
          <NumberField name="fieldName" />
        </Form>
      );
      expect(container).toSnapshot();
    });

    it('doesnt save `NaN` when new value is empty string', function () {
      const onSubmit = jest.fn();
      const {container} = renderWithTheme(
        <Form onSubmit={onSubmit}>
          <NumberField name="fieldName" defaultValue="2" />
        </Form>
      );
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, {target: {value: ''}});
      fireEvent.submit(container.querySelector('form'));
      expect(onSubmit).toHaveBeenCalledWith(
        {fieldName: ''},
        expect.anything(),
        expect.anything()
      );
    });
  });
});

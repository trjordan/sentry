import React from 'react';

import {renderWithTheme, userEvent} from 'sentry-test/reactTestingLibrary';

import RadioGroup from 'app/views/settings/components/forms/controls/radioGroup';

describe('RadioGroup', function () {
  it('renders', function () {
    const mock = jest.fn();
    const {container} = renderWithTheme(
      <RadioGroup
        name="radio"
        label="test"
        value="choice_one"
        choices={[
          ['choice_one', 'Choice One'],
          ['choice_two', 'Choice Two'],
          ['choice_three', 'Choice Three'],
        ]}
        onChange={mock}
      />
    );
    expect(container).toSnapshot();
  });

  it('renders disabled', function () {
    const mock = jest.fn();
    const {container} = renderWithTheme(
      <RadioGroup
        name="radio"
        label="test"
        value="choice_one"
        disabled
        choices={[['choice_one', 'Choice One']]}
        onChange={mock}
      />
    );
    expect(container).toSnapshot();

    const radioInput = container.querySelector('input[type="radio"]');
    expect(radioInput).toBeDisabled();
  });

  it('can select a different item', function () {
    const mock = jest.fn();
    const {container} = renderWithTheme(
      <RadioGroup
        name="radio"
        label="test"
        value="choice_three"
        choices={[
          ['choice_one', 'Choice One'],
          ['choice_two', 'Choice Two'],
          ['choice_three', 'Choice Three'],
        ]}
        onChange={mock}
      />
    );
    expect(container).toSnapshot();
  });

  it('calls onChange when clicked', async function () {
    const mock = jest.fn();

    const {container} = renderWithTheme(
      <RadioGroup
        name="radio"
        label="test"
        value="choice_one"
        choices={[
          ['choice_one', 'Choice One'],
          ['choice_two', 'Choice Two'],
          ['choice_three', 'Choice Three'],
        ]}
        onChange={mock}
      />
    );

    const radioInputs = container.querySelectorAll('input[type="radio"]');
    await userEvent.click(radioInputs[2]);
    expect(mock).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
  });
});

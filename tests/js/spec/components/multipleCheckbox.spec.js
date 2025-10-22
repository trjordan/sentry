import React from 'react';

import {renderWithTheme, userEvent} from 'sentry-test/reactTestingLibrary';

import MultipleCheckbox from 'app/views/settings/components/forms/controls/multipleCheckbox';

describe('MultipleCheckbox', function () {
  it('renders', function () {
    const {container} = renderWithTheme(
      <MultipleCheckbox
        choices={[
          [0, 'Choice A'],
          [1, 'Choice B'],
          [2, 'Choice C'],
        ]}
        value={[1]}
      />
    );

    expect(container).toSnapshot();
  });

  it('unselects a checked input', async function () {
    const onChange = jest.fn();
    const {container} = renderWithTheme(
      <MultipleCheckbox
        choices={[
          [0, 'Choice A'],
          [1, 'Choice B'],
          [2, 'Choice C'],
        ]}
        value={[1]}
        onChange={onChange}
      />
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await userEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith([], expect.anything());
  });

  it('selects an unchecked input', async function () {
    const onChange = jest.fn();
    const {container} = renderWithTheme(
      <MultipleCheckbox
        choices={[
          [0, 'Choice A'],
          [1, 'Choice B'],
          [2, 'Choice C'],
        ]}
        value={[1]}
        onChange={onChange}
      />
    );

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    await userEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith([1, 0], expect.anything());
  });
});

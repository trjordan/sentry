import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import SentryProjectSelectorField from 'app/views/settings/components/forms/sentryProjectSelectorField';

describe('SentryProjectSelectorField', () => {
  it('can change values', async () => {
    const mock = jest.fn();
    const projects = [
      TestStubs.Project(),
      TestStubs.Project({
        id: '23',
        slug: 'my-proj',
        name: 'My Proj',
      }),
    ];
    renderWithTheme(
      <SentryProjectSelectorField
        onChange={mock}
        name="project"
        label="Project"
        projects={projects}
      />
    );

    // React-select adds a textbox inside with the label from the field
    const selectInput = screen.getByRole('textbox', {name: 'Project'});

    // Use fireEvent for the menu to open (userEvent may not trigger the menu properly)
    fireEvent.focus(selectInput);
    fireEvent.keyDown(selectInput, {key: 'ArrowDown', code: 'ArrowDown'});

    // The option text is rendered within a badge component
    const option = await screen.findByText('my-proj');
    await userEvent.click(option);

    expect(mock).toHaveBeenCalledWith('23', expect.anything());
  });
});

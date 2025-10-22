import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import InactivePlugins from 'app/components/inactivePlugins';

describe('InactivePlugins', function () {
  it('renders null when no plugins', function () {
    const {container} = renderWithTheme(
      <InactivePlugins plugins={[]} onEnablePlugin={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders plugins list', function () {
    renderWithTheme(
      <InactivePlugins onEnablePlugin={() => {}} plugins={TestStubs.Plugins()} />
    );
    expect(screen.getByText('Inactive Integrations')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('enables a plugin', async function () {
    const enableFn = jest.fn();
    const plugins = TestStubs.Plugins();
    renderWithTheme(<InactivePlugins onEnablePlugin={enableFn} plugins={plugins} />);
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(enableFn).toHaveBeenCalledWith(expect.objectContaining(plugins[0]));
  });
});

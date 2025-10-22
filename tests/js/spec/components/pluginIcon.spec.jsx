import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import PluginIcon from 'app/plugins/components/pluginIcon';

describe('PluginIcon', function () {
  it('renders', function () {
    const {container} = renderWithTheme(<PluginIcon pluginId="github" size={20} />);
    const icon = container.firstChild;

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({
      height: '20px',
      width: '20px',
    });
  });

  it('renders with default icon with invalid plugin id', function () {
    const {container} = renderWithTheme(<PluginIcon pluginId="invalid" size={20} />);
    const icon = container.firstChild;

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({
      height: '20px',
      width: '20px',
    });
  });
});

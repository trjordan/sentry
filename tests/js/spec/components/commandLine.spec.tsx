import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import CommandLine from 'app/components/commandLine';

describe('CommandLine', () => {
  it('renders', () => {
    const children = 'sentry devserver --workers';
    renderWithTheme(<CommandLine>{children}</CommandLine>);
    expect(screen.getByText(children)).toBeInTheDocument();
  });
});

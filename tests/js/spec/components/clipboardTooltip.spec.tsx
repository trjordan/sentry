import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ClipboardTooltip from 'app/components/clipboardTooltip';

describe('ClipboardTooltip', function () {
  it('renders', function () {
    renderWithTheme(
      <ClipboardTooltip title="tooltip content">
        <span>This text displays a tooltip when hovering</span>
      </ClipboardTooltip>
    );

    expect(
      screen.getByText('This text displays a tooltip when hovering')
    ).toBeInTheDocument();
  });
});

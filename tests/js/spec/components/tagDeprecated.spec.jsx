import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import Tag from 'app/components/tagDeprecated';

describe('Tag', function () {
  it('renders', function () {
    renderWithTheme(
      <Tag priority="info" border size="small">
        Text to Copy
      </Tag>
    );
    expect(screen.getByText('Text to Copy')).toBeInTheDocument();
  });
});

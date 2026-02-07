import React from 'react';

import {render, screen} from '@testing-library/react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import AlertLink from 'app/components/alertLink';
import {IconMail} from 'app/icons';

describe('AlertLink', function () {
  it('renders', function () {
    renderWithTheme(
      <AlertLink to="/settings/accounts/notifications">
        This is an external link button
      </AlertLink>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByText('This is an external link button')).toBeInTheDocument();
  });

  it('renders with icon', function () {
    renderWithTheme(
      <AlertLink to="/settings/accounts/notifications" icon={<IconMail />}>
        This is an external link button
      </AlertLink>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
    expect(screen.getByText('This is an external link button')).toBeInTheDocument();
  });
});

import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import AlertLink from 'app/components/alertLink';
import {IconMail} from 'app/icons';

describe('AlertLink', function () {
  it('renders', function () {
    renderWithTheme(
      <AlertLink to="/settings/accounts/notifications">
        This is an external link button
      </AlertLink>
    );

    const link = screen.getByRole('link', {name: 'This is an external link button'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings/accounts/notifications');
  });

  it('renders with icon', function () {
    renderWithTheme(
      <AlertLink to="/settings/accounts/notifications" icon={<IconMail />}>
        This is an external link button
      </AlertLink>
    );

    const link = screen.getByRole('link', {name: 'This is an external link button'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings/accounts/notifications');
    // Icon is rendered as part of the link
    expect(link.querySelector('svg')).toBeInTheDocument();
  });
});

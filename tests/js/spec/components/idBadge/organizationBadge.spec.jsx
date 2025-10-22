import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import OrganizationBadge from 'app/components/idBadge/organizationBadge';

describe('OrganizationBadge', function () {
  it('renders with Avatar and organization name', function () {
    const {container} = renderWithTheme(
      <OrganizationBadge organization={TestStubs.Organization()} />
    );
    expect(container.querySelector('.avatar')).toBeInTheDocument();
    expect(screen.getByText('org-slug')).toBeInTheDocument();
  });
});

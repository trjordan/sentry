import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import IdBadge from 'app/components/idBadge';

describe('IdBadge', function () {
  it('renders the correct component when `user` property is passed', function () {
    const user = TestStubs.User();
    renderWithTheme(<IdBadge user={user} />);

    // UserBadge renders the user name and email
    expect(screen.getByText('Foo Bar')).toBeInTheDocument();
    expect(screen.getByText('foo@example.com')).toBeInTheDocument();
  });

  it('renders the correct component when `team` property is passed', function () {
    renderWithTheme(<IdBadge team={TestStubs.Team()} />);

    // TeamBadge renders the team slug with '#' prefix
    expect(screen.getByText('#team-slug')).toBeInTheDocument();
  });

  it('renders the correct component when `project` property is passed', function () {
    renderWithTheme(<IdBadge project={TestStubs.Project()} />);

    // ProjectBadge renders the project slug
    expect(screen.getByText('project-slug')).toBeInTheDocument();
  });

  it('renders the correct component when `organization` property is passed', function () {
    renderWithTheme(<IdBadge organization={TestStubs.Organization()} />);

    // OrganizationBadge renders the org slug
    expect(screen.getByText('org-slug')).toBeInTheDocument();
  });

  it('throws when no valid properties are passed', function () {
    console.error.mockReset(); // eslint-disable-line no-console
    expect(() => renderWithTheme(<IdBadge />)).toThrow();
  });
});

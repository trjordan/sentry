import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import ProjectBadge from 'app/components/idBadge/projectBadge';

describe('ProjectBadge', function () {
  it('renders with Avatar and team name', function () {
    const organization = TestStubs.Organization();
    renderWithTheme(
      <ProjectBadge project={TestStubs.Project()} organization={organization} />
    );
    expect(screen.getByText('project-slug')).toBeInTheDocument();
  });
});

import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import OrganizationStats from 'app/views/organizationStats/organizationStatsDetails';

describe('OrganizationStats', function () {
  it('renders', function () {
    const organization = TestStubs.Organization();
    const props = {
      statsLoading: false,
      projectsLoading: false,
      orgTotal: {},
      orgStats: [],
      projectTotals: [],
      projectMap: {},
      organization,
    };

    render(<OrganizationStats {...props} />, {
      context: TestStubs.routerContext([{organization}]),
    });

    expect(screen.getByText('Organization Stats')).toBeInTheDocument();
    // MiniBarChart and ProjectTable are internal components that render - we verify the page structure
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.queryByTestId('performance-usage')).not.toBeInTheDocument();
  });

  it('renders alert for performance feature', function () {
    const organization = TestStubs.Organization({features: ['performance-view']});
    const props = {
      statsLoading: false,
      projectsLoading: false,
      orgTotal: {},
      orgStats: [],
      projectTotals: [],
      projectMap: {},
      organization,
    };

    render(<OrganizationStats {...props} />, {
      context: TestStubs.routerContext([{organization}]),
    });

    expect(screen.getByText('Organization Stats')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByTestId('performance-usage')).toBeInTheDocument();
  });
});

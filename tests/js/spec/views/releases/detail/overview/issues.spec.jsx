import React from 'react';

import {fireEvent, render, screen} from 'sentry-test/reactTestingLibrary';
import {initializeOrg} from 'sentry-test/initializeOrg';

import Issues from 'app/views/releases/detail/overview/issues';

describe('Release Issues', function () {
  let newIssuesEndpoint;
  let resolvedIssuesEndpoint;
  let unhandledIssuesEndpoint;
  let allIssuesEndpoint;
  let props;
  let routerContext;

  beforeEach(function () {
    const {organization, routerContext: rc} = initializeOrg();
    routerContext = rc;

    props = {
      organization,
      version: '1.0.0',
      selection: {datetime: {period: '14d'}},
      location: {query: {}},
    };

    newIssuesEndpoint = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues/?groupStatsPeriod=auto&limit=10&query=release%3A1.0.0%20is%3Aunresolved%20first-release%3A1.0.0&sort=freq&statsPeriod=14d`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues-count/?query=release%3A1.0.0%20is%3Aunresolved%20first-release%3A1.0.0&statsPeriod=14d`,
      body: {},
    });

    resolvedIssuesEndpoint = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues/?groupStatsPeriod=auto&limit=10&query=release%3A1.0.0%20is%3Aresolved&sort=freq&statsPeriod=14d`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues-count/?query=release%3A1.0.0%20is%3Aresolved&statsPeriod=14d`,
      body: {},
    });

    unhandledIssuesEndpoint = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues/?groupStatsPeriod=auto&limit=10&query=release%3A1.0.0%20error.unhandled%3Atrue&sort=freq&statsPeriod=14d`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues-count/?query=release%3A1.0.0%20error.unhandled%3Atrue&statsPeriod=14d`,
      body: {},
    });

    allIssuesEndpoint = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues/?groupStatsPeriod=auto&limit=10&query=release%3A1.0.0&sort=freq&statsPeriod=14d`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/issues-count/?query=release%3A1.0.0&statsPeriod=14d`,
      body: {},
    });
  });

  const selectFilter = async filterTestId => {
    // Open the dropdown
    fireEvent.click(screen.getByTestId('filter'));

    // Click the filter option
    const filterOption = await screen.findByTestId(filterTestId);
    fireEvent.click(filterOption);
  };

  it('shows an empty state', async function () {
    render(<Issues {...props} />, {context: routerContext});

    expect(
      await screen.findByText('No new issues for the last 14 days.')
    ).toBeInTheDocument();
  });

  it('shows empty state with 24h period', async function () {
    render(<Issues {...props} selection={{datetime: {period: '24h'}}} />, {
      context: routerContext,
    });

    expect(
      await screen.findByText('No new issues for the last 24 hours.')
    ).toBeInTheDocument();
  });

  it('shows empty state for resolved issues', async function () {
    render(<Issues {...props} />, {context: routerContext});

    // Wait for initial load
    expect(
      await screen.findByText('No new issues for the last 14 days.')
    ).toBeInTheDocument();

    await selectFilter('filter-resolved');

    expect(await screen.findByText('No resolved issues.')).toBeInTheDocument();
  });

  it('shows empty state for unhandled issues', async function () {
    render(<Issues {...props} selection={{datetime: {period: '24h'}}} />, {
      context: routerContext,
    });

    // Wait for initial load
    expect(
      await screen.findByText('No new issues for the last 24 hours.')
    ).toBeInTheDocument();

    await selectFilter('filter-unhandled');

    expect(
      await screen.findByText('No unhandled issues for the last 24 hours.')
    ).toBeInTheDocument();
  });

  it('filters the issues', async function () {
    render(<Issues {...props} />, {context: routerContext});

    // Wait for initial render
    await screen.findByTestId('filter');

    // Open dropdown and check options
    fireEvent.click(screen.getByTestId('filter'));
    expect(await screen.findByTestId('filter-new')).toBeInTheDocument();
    expect(screen.getByTestId('filter-resolved')).toBeInTheDocument();
    expect(screen.getByTestId('filter-unhandled')).toBeInTheDocument();
    expect(screen.getByTestId('filter-all')).toBeInTheDocument();

    // Verify "Unhandled Issues" text
    expect(screen.getByText('Unhandled Issues')).toBeInTheDocument();

    // Close dropdown before selecting filters
    fireEvent.click(screen.getByTestId('filter'));

    await selectFilter('filter-new');
    expect(newIssuesEndpoint).toHaveBeenCalledTimes(2); // Once on mount, once on filter

    await selectFilter('filter-resolved');
    expect(resolvedIssuesEndpoint).toHaveBeenCalledTimes(1);

    await selectFilter('filter-unhandled');
    expect(unhandledIssuesEndpoint).toHaveBeenCalledTimes(1);

    await selectFilter('filter-all');
    expect(allIssuesEndpoint).toHaveBeenCalledTimes(1);
  });

  it('renders link to Discover when user has access', async function () {
    const initializationObj = initializeOrg({
      organization: {
        features: ['discover-basic'],
      },
    });

    render(<Issues {...props} organization={initializationObj.organization} />, {
      context: initializationObj.routerContext,
    });

    const discoverLink = await screen.findByTestId('discover-button');
    expect(discoverLink).toHaveAttribute('href');
    // Verify it links to discover
    expect(discoverLink.getAttribute('href')).toContain('/discover/results/');
    expect(discoverLink.getAttribute('href')).toContain('release%3A1.0.0');
  });

  it('does not render link to Discover when user lacks access', async function () {
    render(<Issues {...props} />, {context: routerContext});

    // Wait for component to render
    await screen.findByTestId('issues-button');

    expect(screen.queryByTestId('discover-button')).not.toBeInTheDocument();
  });

  it('renders link to Issues', async function () {
    render(<Issues {...props} />, {context: routerContext});

    const issuesLink = await screen.findByTestId('issues-button');
    expect(issuesLink).toHaveAttribute('href');
    // Verify it links to issues with correct query params
    expect(issuesLink.getAttribute('href')).toContain('/issues/');
    expect(issuesLink.getAttribute('href')).toContain('release%3A1.0.0');
    expect(issuesLink.getAttribute('href')).toContain('first-release%3A1.0.0');
  });
});

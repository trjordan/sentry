import React from 'react';
import {browserHistory} from 'react-router';

import {renderWithTheme, screen, userEvent, waitFor} from 'sentry-test/reactTestingLibrary';
import {initializeOrg} from 'sentry-test/initializeOrg';

import GlobalSelectionStore from 'app/stores/globalSelectionStore';
import ProjectsStore from 'app/stores/projectsStore';
import TransactionSummary from 'app/views/performance/transactionSummary';

function initializeData({features: additionalFeatures = [], query = {}} = {}) {
  const features = ['discover-basic', 'performance-view', ...additionalFeatures];
  const organization = TestStubs.Organization({
    features,
    projects: [TestStubs.Project()],
    apdexThreshold: 400,
  });
  const initialData = initializeOrg({
    organization,
    router: {
      location: {
        query: {
          transaction: '/performance',
          project: 1,
          transactionCursor: '1:0:0',
          ...query,
        },
      },
    },
  });
  ProjectsStore.loadInitialData(initialData.organization.projects);
  return initialData;
}

describe('Performance > TransactionSummary', function () {
  beforeEach(function () {
    GlobalSelectionStore.reset();
    
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/projects/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/user.email/values/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-stats/',
      body: {data: [[123, []]]},
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/releases/stats/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url:
        '/organizations/org-slug/issues/?limit=5&project=1&query=is%3Aunresolved%20transaction%3A%2Fperformance&sort=new&statsPeriod=14d',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/users/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      method: 'POST',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/sdk-updates/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {},
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/is-key-transactions/',
      body: [],
    });

    // Mock totals for the sidebar and other summary data
    MockApiClient.addMockResponse(
      {
        url: '/organizations/org-slug/eventsv2/',
        body: {
          meta: {
            count: 'number',
            apdex_400: 'number',
            count_miserable_user_400: 'number',
            user_misery_400: 'number',
            count_unique_user: 'number',
            p95: 'number',
            failure_rate: 'number',
            tpm: 'number',
          },
          data: [
            {
              count: 2,
              apdex_400: 0.6,
              count_miserable_user_400: 122,
              user_misery_400: 0.114,
              count_unique_user: 1,
              p95: 750.123,
              failure_rate: 1,
              tpm: 1,
            },
          ],
        },
      },
      {
        predicate: (url, options) => {
          return url.includes('eventsv2') && options.query?.field.includes('p95()');
        },
      }
    );
    // Transaction list response
    MockApiClient.addMockResponse(
      {
        url: '/organizations/org-slug/eventsv2/',
        headers: {
          Link:
            '<http://localhost/api/0/organizations/org-slug/eventsv2/?cursor=2:0:0>; rel="next"; results="true"; cursor="2:0:0",' +
            '<http://localhost/api/0/organizations/org-slug/eventsv2/?cursor=1:0:0>; rel="previous"; results="false"; cursor="1:0:0"',
        },
        body: {
          meta: {
            id: 'string',
            'user.display': 'string',
            'transaction.duration': 'duration',
            'project.id': 'integer',
            timestamp: 'date',
          },
          data: [
            {
              id: 'deadbeef',
              'user.display': 'uhoh@example.com',
              'transaction.duration': 400,
              'project.id': 1,
              timestamp: '2020-05-21T15:31:18+00:00',
            },
          ],
        },
      },
      {
        predicate: (url, options) => {
          return (
            url.includes('eventsv2') && options.query?.field.includes('user.display')
          );
        },
      }
    );
    // Mock totals for status breakdown
    MockApiClient.addMockResponse(
      {
        url: '/organizations/org-slug/eventsv2/',
        body: {
          meta: {
            'transaction.status': 'string',
            count: 'number',
          },
          data: [
            {
              count: 2,
              'transaction.status': 'ok',
            },
          ],
        },
      },
      {
        predicate: (url, options) => {
          return (
            url.includes('eventsv2') &&
            options.query?.field.includes('transaction.status')
          );
        },
      }
    );
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-facets/',
      body: [
        {
          key: 'release',
          topValues: [{count: 2, value: 'abcd123', name: 'abcd123'}],
        },
        {
          key: 'environment',
          topValues: [{count: 2, value: 'abcd123', name: 'abcd123'}],
        },
      ],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-vitals/',
      body: {
        'measurements.fcp': {
          poor: 3,
          meh: 100,
          good: 47,
          total: 150,
          p75: 1500,
        },
        'measurements.lcp': {
          poor: 2,
          meh: 38,
          good: 40,
          total: 80,
          p75: 2750,
        },
        'measurements.fid': {
          poor: 2,
          meh: 53,
          good: 5,
          total: 60,
          p75: 1000,
        },
        'measurements.cls': {
          poor: 3,
          meh: 10,
          good: 4,
          total: 17,
          p75: 0.2,
        },
      },
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
    ProjectsStore.reset();
  });

  it('renders basic UI elements', async function () {
    const initialData = initializeData();
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // It shows a chart
    expect(await screen.findByTestId('transaction-summary-charts')).toBeInTheDocument();

    // It shows a searchbar
    expect(screen.getByPlaceholderText('Search events')).toBeInTheDocument();

    // It shows a table
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Ensure open in discover button exists.
    expect(screen.getByTestId('discover-open')).toBeInTheDocument();

    // Ensure open issues button exists.
    expect(screen.getByTestId('issues-open')).toBeInTheDocument();

    // Ensure transaction filter button exists
    expect(screen.getByTestId('filter-transactions')).toBeInTheDocument();

    // Ensure create alert from discover is hidden without metric alert
    expect(screen.queryByText('Create Alert')).not.toBeInTheDocument();
  });

  it('renders feature flagged UI elements', async function () {
    const initialData = initializeData();
    initialData.organization.features.push('incidents');
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // Ensure create alert from discover is shown with metric alerts
    expect(await screen.findByText('Create Alert')).toBeInTheDocument();
  });

  it('triggers a navigation on search', async function () {
    const initialData = initializeData();
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // Fill out the search box, and submit it.
    const searchInput = await screen.findByPlaceholderText('Search events');
    await userEvent.type(searchInput, 'user.email:uhoh*');
    await userEvent.keyboard('{Enter}');

    // Check the navigation.
    expect(browserHistory.push).toHaveBeenCalledTimes(1);
    expect(browserHistory.push).toHaveBeenCalledWith({
      pathname: undefined,
      query: {
        transaction: '/performance',
        project: 1,
        statsPeriod: '14d',
        query: 'user.email:uhoh*',
        transactionCursor: '1:0:0',
      },
    });
  });

  it('can mark a transaction as key', async function () {
    const mockUpdate = MockApiClient.addMockResponse({
      url: `/organizations/org-slug/key-transactions/`,
      method: 'POST',
      body: {},
    });

    const initialData = initializeData();
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // Click the key transaction button
    const keyTransactionButton = await screen.findByRole('button', {name: /key transaction/i});
    await userEvent.click(keyTransactionButton);

    // Ensure request was made.
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  it('triggers a navigation on transaction filter', async function () {
    const initialData = initializeData();
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // Open the transaction filter dropdown
    const filterButton = await screen.findByTestId('filter-transactions');
    await userEvent.click(filterButton);

    // Click the second item (fastest transactions)
    const dropdownItems = await screen.findAllByRole('option');
    await userEvent.click(dropdownItems[1]);

    // Check the navigation.
    expect(browserHistory.push).toHaveBeenCalledWith({
      pathname: undefined,
      query: {
        transaction: '/performance',
        project: 1,
        showTransactions: 'slow',
        transactionCursor: undefined,
      },
    });
  });

  it('renders pagination buttons', async function () {
    const initialData = initializeData();
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    // Wait for pagination to be rendered
    const nextButton = await screen.findByRole('button', {name: 'Next'});
    expect(nextButton).toBeInTheDocument();

    // Click the 'next' button
    await userEvent.click(nextButton);

    // Check the navigation.
    expect(browserHistory.push).toHaveBeenCalledWith({
      pathname: undefined,
      query: {
        transaction: '/performance',
        project: 1,
        transactionCursor: '2:0:0',
      },
    });
  });

  it('forwards conditions to related issues', async function () {
    const issueGet = MockApiClient.addMockResponse({
      url:
        '/organizations/org-slug/issues/?limit=5&project=1&query=tag%3Avalue%20is%3Aunresolved%20transaction%3A%2Fperformance&sort=new&statsPeriod=14d',
      body: [],
    });

    const initialData = initializeData({query: {query: 'tag:value'}});
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    await waitFor(() => {
      expect(issueGet).toHaveBeenCalled();
    });
  });

  it('does not forward event type to related issues', async function () {
    const issueGet = MockApiClient.addMockResponse(
      {
        url:
          '/organizations/org-slug/issues/?limit=5&project=1&query=tag%3Avalue%20is%3Aunresolved%20transaction%3A%2Fperformance&sort=new&statsPeriod=14d',
        body: [],
      },
      {
        predicate: (url, options) =>
          url.startsWith(`/organizations/org-slug/issues/`) &&
          // event.type must NOT be in the query params
          !options.query?.query?.includes('event.type'),
      }
    );

    const initialData = initializeData({
      query: {query: 'tag:value event.type:transaction'},
    });
    renderWithTheme(
      <TransactionSummary
        api={new MockApiClient()}
        organization={initialData.organization}
        projects={initialData.projects}
        selection={{projects: [1], environments: [], datetime: {period: '14d'}}}
        location={initialData.router.location}
        params={{orgId: 'org-slug'}}
        loadingProjects={false}
      />,
      {context: initialData.routerContext.context}
    );

    await waitFor(() => {
      expect(issueGet).toHaveBeenCalled();
    });
  });
});

import React from 'react';

import {render, screen, userEvent, waitFor, within, tick} from 'sentry-test/reactTestingLibrary';

import DashboardList from 'app/views/dashboardsV2/manage/dashboardList';

async function openContextMenu(container) {
  const moreButton = within(container).getByRole('button', {name: /dashboard actions/i});
  await userEvent.click(moreButton);
}

async function clickMenuItem(selector) {
  const menuItem = screen.getByTestId(selector);
  await userEvent.click(menuItem);
}

describe('Dashboards > DashboardList', function () {
  let dashboards, widgets, deleteMock, dashboardUpdateMock, createMock;
  const organization = TestStubs.Organization({
    features: ['global-views', 'dashboards-basic', 'dashboards-edit', 'discover-query'],
    projects: [TestStubs.Project()],
  });

  beforeEach(function () {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/projects/',
      body: [],
    });
    widgets = [
      TestStubs.Widget(
        [{name: '', conditions: 'event.type:error', fields: ['count()']}],
        {
          title: 'Errors',
          interval: '1d',
          id: '1',
        }
      ),
      TestStubs.Widget(
        [{name: '', conditions: 'event.type:transaction', fields: ['count()']}],
        {
          title: 'Transactions',
          interval: '1d',
          id: '2',
        }
      ),
      TestStubs.Widget(
        [
          {
            name: '',
            conditions: 'event.type:transaction transaction:/api/cats',
            fields: ['p50()'],
          },
        ],
        {
          title: 'p50 of /api/cats',
          interval: '1d',
          id: '3',
        }
      ),
    ];
    dashboards = [
      TestStubs.Dashboard([], {
        id: '1',
        title: 'Dashboard 1',
        dateCreated: '2021-04-19T13:13:23.962105Z',
        createdBy: {id: '1'},
        widgetDisplay: [],
      }),
      TestStubs.Dashboard(widgets, {
        id: '2',
        title: 'Dashboard 2',
        dateCreated: '2021-04-19T13:13:23.962105Z',
        createdBy: {id: '1'},
        widgetDisplay: ['line', 'table'],
      }),
    ];
    deleteMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/dashboards/2/',
      method: 'DELETE',
      statusCode: 200,
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/dashboards/2/',
      method: 'GET',
      statusCode: 200,
      body: {
        id: '2',
        title: 'Dashboard Demo',
        widgets: [
          {
            id: '1',
            title: 'Errors',
            displayType: 'big_number',
            interval: '5m',
          },
          {
            id: '2',
            title: 'Transactions',
            displayType: 'big_number',
            interval: '5m',
          },
          {
            id: '3',
            title: 'p50 of /api/cat',
            displayType: 'big_number',
            interval: '5m',
          },
        ],
      },
    });
    createMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/dashboards/',
      method: 'POST',
      statusCode: 200,
    });
    dashboardUpdateMock = jest.fn();
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('renders an empty list', function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={[]}
        pageLinks=""
        location={{query: {}}}
      />
    );
    // No dashboards
    expect(screen.queryByTestId('dashboard-card')).not.toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders dashboard list', function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={dashboards}
        pageLinks=""
        location={{query: {}}}
      />
    );
    expect(screen.getAllByTestId('dashboard-card')).toHaveLength(2);
  });

  it('returns landing page url for dashboards', function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={dashboards}
        pageLinks=""
        location={{query: {}}}
      />
    );
    const cards = screen.getAllByTestId('dashboard-card');
    const links = within(cards[1]).getAllByRole('link');
    const lastLink = links[links.length - 1];
    expect(lastLink).toHaveAttribute('href', '/organizations/org-slug/dashboards/2/');
  });

  it('persists global selection headers', function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={dashboards}
        pageLinks=""
        location={{query: {statsPeriod: '7d'}}}
      />
    );
    const cards = screen.getAllByTestId('dashboard-card');
    const links = within(cards[1]).getAllByRole('link');
    const lastLink = links[links.length - 1];
    expect(lastLink).toHaveAttribute('href', '/organizations/org-slug/dashboards/2/?statsPeriod=7d');
  });

  it('can delete dashboards', async function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={dashboards}
        pageLinks=""
        location={{query: {}}}
        onDashboardsChange={dashboardUpdateMock}
      />
    );
    const cards = screen.getAllByTestId('dashboard-card');
    const secondCard = cards[1];
    expect(within(secondCard).getByText(dashboards[1].title)).toBeInTheDocument();

    await openContextMenu(secondCard);
    await clickMenuItem('dashboard-delete');
    await tick();

    expect(deleteMock).toHaveBeenCalled();
    expect(dashboardUpdateMock).toHaveBeenCalled();
  });

  it('can duplicate dashboards', async function () {
    render(
      <DashboardList
        organization={organization}
        dashboards={dashboards}
        pageLinks=""
        location={{query: {}}}
        onDashboardsChange={dashboardUpdateMock}
      />
    );
    const cards = screen.getAllByTestId('dashboard-card');
    const secondCard = cards[1];
    expect(within(secondCard).getByText(dashboards[1].title)).toBeInTheDocument();

    await openContextMenu(secondCard);
    await clickMenuItem('dashboard-duplicate');
    await tick();

    expect(createMock).toHaveBeenCalled();
    expect(dashboardUpdateMock).toHaveBeenCalled();
  });
});

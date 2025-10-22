import React from 'react';

import {mockZoomRange} from 'sentry-test/charts';
import {initializeOrg} from 'sentry-test/initializeOrg';
import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import BaseChart from 'app/components/charts/baseChart';
import EventsChart from 'app/components/charts/eventsChart';

jest.mock('app/components/charts/baseChart', () => {
  return jest.fn().mockImplementation(() => <div data-testid="area-chart" />);
});

describe('EventsChart with legend', function () {
  const {router, org} = initializeOrg();

  beforeEach(function () {
    mockZoomRange(1543449600000, 1543708800000);
    BaseChart.mockClear();
    MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/releases/`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/releases/stats/`,
      body: [],
    });
    MockApiClient.addMockResponse({
      url: `/organizations/${org.slug}/events-stats/`,
      method: 'GET',
      body: {
        data: [
          [1543449600, [20, 12]],
          [1543449601, [10, 5]],
        ],
      },
    });
  });

  it('renders a legend if enabled', function () {
    renderWithTheme(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        projects={[]}
        environments={[]}
        query=""
        yAxis="count()"
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
        showLegend
      />
    );

    // Wait for tick to allow the mock API to resolve and component to render
    return tick().then(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(BaseChart.mock.calls[0][0].legend).toHaveProperty('data');
    });
  });
});

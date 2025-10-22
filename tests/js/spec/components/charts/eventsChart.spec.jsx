import React from 'react';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import * as globalSelection from 'app/actionCreators/globalSelection';
import ChartZoom from 'app/components/charts/chartZoom';
import EventsChart from 'app/components/charts/eventsChart';
import {getUtcToLocalDateObject} from 'app/utils/dates';

jest.mock('app/components/charts/eventsRequest', () => jest.fn(() => null));
jest.spyOn(globalSelection, 'updateDateTime');

describe('EventsChart', function () {
  const {router, org} = initializeOrg();

  // Track the current zoom range
  let currentZoomRange = {
    rangeStart: 1543449600000,
    rangeEnd: 1543708800000,
  };

  // Create a mock chart object that matches what echarts provides
  const mockChart = {
    getModel: jest.fn(() => ({
      option: {
        xAxis: [
          {
            rangeStart: currentZoomRange.rangeStart,
            rangeEnd: currentZoomRange.rangeEnd,
          },
        ],
        series: [
          {
            data: [
              [1543276800000, 0],
              [1543363200000, 0],
              [1543449600000, 36],
              [1543536000000, 40],
              [1543622400000, 0],
              [1543708800000, 17],
              [1543795200000, 104],
              [1543881600000, 13],
            ],
          },
        ],
      },
    })),
    dispatchAction: jest.fn(),
  };

  let chartZoomRef;

  beforeEach(function () {
    globalSelection.updateDateTime.mockClear();
    currentZoomRange = {
      rangeStart: 1543449600000,
      rangeEnd: 1543708800000,
    };
    chartZoomRef = null;
  });

  it('renders', function () {
    const {container} = renderWithTheme(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('re-renders if period from props changes', function () {
    const {rerender} = renderWithTheme(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    rerender(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        period="7d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    // Component should re-render without errors
    expect(globalSelection.updateDateTime).not.toHaveBeenCalled();
  });

  it('re-renders if query from props changes', function () {
    const {rerender} = renderWithTheme(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    rerender(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        query="newQuery"
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    // Component should re-render without errors
    expect(globalSelection.updateDateTime).not.toHaveBeenCalled();
  });

  it('re-renders if project from props changes', function () {
    const {rerender} = renderWithTheme(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[]}
        environment={[]}
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    rerender(
      <EventsChart
        api={new MockApiClient()}
        location={{query: {}}}
        organization={org}
        project={[2]}
        environment={[]}
        period="14d"
        start={null}
        end={null}
        utc={false}
        router={router}
      />
    );

    // Component should re-render without errors
    expect(globalSelection.updateDateTime).not.toHaveBeenCalled();
  });

  it('has correct history entries when zooming', function () {
    // Create a ref to access ChartZoom instance for this test
    const chartZoomRefCallback = ref => {
      chartZoomRef = ref;
    };

    renderWithTheme(
      <ChartZoom
        ref={chartZoomRefCallback}
        router={router}
        period="14d"
        start={null}
        end={null}
        utc={false}
      >
        {() => <div data-test-id="chart-child" />}
      </ChartZoom>
    );

    // Simulate zoom action
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    expect(chartZoomRef.history).toEqual([
      {
        period: '14d',
        start: null,
        end: null,
      },
    ]);
    expect(chartZoomRef.currentPeriod.period).toEqual(null);
    expect(chartZoomRef.currentPeriod.start).toEqual('2018-11-29T00:00:00');
    expect(chartZoomRef.currentPeriod.end).toEqual('2018-12-02T00:00:00');

    // Zoom again - update the current zoom range
    currentZoomRange = {
      rangeStart: 1543536000000,
      rangeEnd: 1543708800000,
    };
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    expect(chartZoomRef.currentPeriod.period).toEqual(null);
    expect(chartZoomRef.currentPeriod.start).toEqual('2018-11-30T00:00:00');
    expect(chartZoomRef.currentPeriod.end).toEqual('2018-12-02T00:00:00');

    expect(chartZoomRef.history[0]).toEqual({
      period: '14d',
      start: null,
      end: null,
    });
    expect(chartZoomRef.history[1].start).toEqual('2018-11-29T00:00:00');
    expect(chartZoomRef.history[1].end).toEqual('2018-12-02T00:00:00');

    // go back in history
    currentZoomRange = {
      rangeStart: null,
      rangeEnd: null,
    };
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    expect(chartZoomRef.currentPeriod.period).toEqual(null);
    expect(chartZoomRef.currentPeriod.start).toEqual('2018-11-29T00:00:00');
    expect(chartZoomRef.currentPeriod.end).toEqual('2018-12-02T00:00:00');

    const newParams = {
      period: null,
      start: getUtcToLocalDateObject('2018-11-29T00:00:00'),
      end: getUtcToLocalDateObject('2018-12-02T00:00:00'),
    };
    expect(globalSelection.updateDateTime).toHaveBeenCalledWith(newParams, router);
  });

  it('updates url params when restoring zoom level on chart', function () {
    // Create a ref to access ChartZoom instance for this test
    const chartZoomRefCallback = ref => {
      chartZoomRef = ref;
    };

    renderWithTheme(
      <ChartZoom
        ref={chartZoomRefCallback}
        router={router}
        period="14d"
        start={null}
        end={null}
        utc={false}
      >
        {() => <div data-test-id="chart-child" />}
      </ChartZoom>
    );

    // Simulate multiple zoom actions
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    // Zoom again - update the current zoom range
    currentZoomRange = {
      rangeStart: 1543536000000,
      rangeEnd: 1543708800000,
    };
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    // Zoom one more time
    currentZoomRange = {
      rangeStart: 1543622400000,
      rangeEnd: 1543708800000,
    };
    chartZoomRef.handleDataZoom({}, mockChart);
    chartZoomRef.handleChartFinished();

    expect(chartZoomRef.history).toHaveLength(3);

    // Restore history
    chartZoomRef.handleZoomRestore();
    chartZoomRef.handleChartFinished();

    expect(chartZoomRef.currentPeriod).toEqual({
      period: '14d',
      start: null,
      end: null,
    });

    const newParams = {
      period: '14d',
      start: null,
      end: null,
    };
    expect(globalSelection.updateDateTime).toHaveBeenLastCalledWith(newParams, router);

    expect(chartZoomRef.history).toHaveLength(0);
  });
});

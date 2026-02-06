import {act, render, waitFor} from '@testing-library/react';

import EventsRequest from 'app/components/charts/eventsRequest';

const COUNT_OBJ = {
  count: 123,
};

describe('EventsRequest', function () {
  const project = TestStubs.Project();
  const organization = TestStubs.Organization();
  const mock = jest.fn(() => null);
  const DEFAULTS = {
    api: new MockApiClient(),
    projects: [parseInt(project.id, 10)],
    environments: [],
    period: '24h',
    organization,
    tag: 'release',
    includePrevious: false,
    includeTimeseries: true,
  };

  let eventsStatsMock;
  beforeEach(function () {
    mock.mockClear();
    eventsStatsMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-stats/',
      body: {
        data: [
          [123, [COUNT_OBJ]],
          [456, [COUNT_OBJ]],
        ],
      },
    });
  });

  it('makes requests', async function () {
    render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);
    expect(mock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        loading: true,
      })
    );

    await waitFor(() => {
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,
          timeseriesData: [
            {
              seriesName: expect.anything(),
              data: [
                {name: 123 * 1000, value: 123},
                {name: 456 * 1000, value: 123},
              ],
            },
          ],
          originalTimeseriesData: [
            [123, [COUNT_OBJ]],
            [456, [COUNT_OBJ]],
          ],
        })
      );
    });

    expect(eventsStatsMock).toHaveBeenCalledTimes(1);
  });

  it('makes a new request if projects prop changes', async function () {
    const {rerender} = render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);
    
    await waitFor(() => {
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({loading: false})
      );
    });

    rerender(
      <EventsRequest {...DEFAULTS} projects={[123]}>
        {mock}
      </EventsRequest>
    );

    await waitFor(() => {
      expect(eventsStatsMock).toHaveBeenCalledTimes(2);
      expect(eventsStatsMock).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          query: expect.objectContaining({
            project: [123],
          }),
        })
      );
    });
  });

  it('makes a new request if environments prop changes', async function () {
    const {rerender} = render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);

    await waitFor(() => {
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({loading: false})
      );
    });

    rerender(
      <EventsRequest {...DEFAULTS} environments={['dev']}>
        {mock}
      </EventsRequest>
    );

    await waitFor(() => {
      expect(eventsStatsMock).toHaveBeenCalledTimes(2);
      expect(eventsStatsMock).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          query: expect.objectContaining({
            environment: ['dev'],
          }),
        })
      );
    });
  });

  it('makes a new request if period prop changes', async function () {
    const {rerender} = render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);

    await waitFor(() => {
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({loading: false})
      );
    });

    rerender(
      <EventsRequest {...DEFAULTS} period="7d">
        {mock}
      </EventsRequest>
    );

    await waitFor(() => {
      expect(eventsStatsMock).toHaveBeenCalledTimes(2);
      expect(eventsStatsMock).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          query: expect.objectContaining({
            statsPeriod: '7d',
          }),
        })
      );
    });
  });

  it('makes a new request if start/end prop changes', async function () {
    const {rerender} = render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);

    await waitFor(() => {
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({loading: false})
      );
    });

    rerender(
      <EventsRequest
        {...DEFAULTS}
        start={new Date()}
        end={new Date()}
      >
        {mock}
      </EventsRequest>
    );

    await waitFor(() => {
      expect(eventsStatsMock).toHaveBeenCalledTimes(2);
      expect(eventsStatsMock).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          query: expect.objectContaining({
            start: expect.anything(),
            end: expect.anything(),
          }),
        })
      );
    });
  });

  describe('transforms', function () {
    beforeEach(function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {
          data: [
            [123, [COUNT_OBJ]],
            [456, [COUNT_OBJ]],
            [789, [COUNT_OBJ]],
          ],
        },
      });
    });

    it('expands period in query if `includePrevious`', async function () {
      render(
        <EventsRequest {...DEFAULTS} includePrevious>
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              statsPeriod: '48h',
            }),
          })
        );
      });
    });

    it('converts to relative period', async function () {
      render(
        <EventsRequest
          {...DEFAULTS}
          includePrevious
          period="14d"
        >
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              statsPeriod: '28d',
            }),
          })
        );
      });
    });

    it('converts to relative period (7d)', async function () {
      render(
        <EventsRequest
          {...DEFAULTS}
          includePrevious
          period="7d"
        >
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              statsPeriod: '14d',
            }),
          })
        );
      });
    });

    it('does NOT convert when start/end', async function () {
      render(
        <EventsRequest
          {...DEFAULTS}
          includePrevious
          start={new Date()}
          end={new Date()}
        >
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              start: expect.anything(),
              end: expect.anything(),
            }),
          })
        );
        expect(eventsStatsMock).not.toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              statsPeriod: expect.anything(),
            }),
          })
        );
      });
    });

    it('splits results into `previous` and `current` data if `includePrevious`', async function () {
      render(
        <EventsRequest {...DEFAULTS} includePrevious>
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            loading: false,
            allTimeseriesData: [
              [123, [COUNT_OBJ]],
              [456, [COUNT_OBJ]],
              [789, [COUNT_OBJ]],
            ],
            timeseriesData: [
              {
                seriesName: expect.anything(),
                data: [{name: 789 * 1000, value: 123}],
              },
            ],
            previousTimeseriesData: {
              seriesName: 'Previous',
              data: [
                {name: 456 * 1000, value: 123},
                {name: 789 * 1000, value: 123},
              ],
            },
            originalTimeseriesData: [
              [456, [COUNT_OBJ]],
              [789, [COUNT_OBJ]],
            ],
            originalPreviousTimeseriesData: [
              [123, [COUNT_OBJ]],
              [456, [COUNT_OBJ]],
            ],
          })
        );
      });
    });
  });

  describe('timeAggregatedData', function () {
    beforeEach(function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {
          data: [
            [123, [COUNT_OBJ]],
            [456, [COUNT_OBJ]],
            [789, [COUNT_OBJ]],
          ],
        },
      });
    });

    it('aggregates data when `includeTimeAggregation` is true', async function () {
      render(
        <EventsRequest
          {...DEFAULTS}
          includeTimeAggregation
          timeAggregationSeriesName="count"
        >
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            timeAggregatedData: {
              seriesName: 'count',
              data: [{name: expect.anything(), value: expect.anything()}],
            },
          })
        );
      });
    });

    it('does not get aggregated data if `includeTimeAggregation` is false', async function () {
      render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);

      await waitFor(() => {
        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            timeAggregatedData: {},
          })
        );
      });
    });
  });

  describe('yAxis', function () {
    beforeEach(function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {
          data: [
            [123, [COUNT_OBJ]],
            [456, [COUNT_OBJ]],
            [789, [COUNT_OBJ]],
          ],
        },
      });
    });

    it('supports yAxis', async function () {
      render(
        <EventsRequest {...DEFAULTS} yAxis="apdex()">
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              yAxis: 'apdex()',
            }),
          })
        );
      });
    });

    it('supports multiple yAxis', async function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {
          'apdex()': {
            data: [
              [123, [COUNT_OBJ]],
              [456, [COUNT_OBJ]],
              [789, [COUNT_OBJ]],
            ],
          },
          'epm()': {
            data: [
              [123, [COUNT_OBJ]],
              [456, [COUNT_OBJ]],
              [789, [COUNT_OBJ]],
            ],
          },
        },
      });

      render(
        <EventsRequest {...DEFAULTS} yAxis={['apdex()', 'epm()']}>
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        const [, result] = mock.mock.calls[mock.mock.calls.length - 1];
        expect(result).toBeUndefined();
        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            loading: false,
            results: [
              {
                seriesName: 'apdex()',
                data: [
                  {name: 123 * 1000, value: 123},
                  {name: 456 * 1000, value: 123},
                  {name: 789 * 1000, value: 123},
                ],
              },
              {
                seriesName: 'epm()',
                data: [
                  {name: 123 * 1000, value: 123},
                  {name: 456 * 1000, value: 123},
                  {name: 789 * 1000, value: 123},
                ],
              },
            ],
          })
        );
      });
    });
  });

  describe('topEvents', function () {
    beforeEach(function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        body: {
          'field,value': {
            data: [
              [123, [COUNT_OBJ]],
              [456, [COUNT_OBJ]],
              [789, [COUNT_OBJ]],
            ],
          },
        },
      });
    });

    it('supports topEvents parameter', async function () {
      render(
        <EventsRequest
          {...DEFAULTS}
          field={['field', 'value']}
          topEvents={5}
        >
          {mock}
        </EventsRequest>
      );

      await waitFor(() => {
        expect(eventsStatsMock).toHaveBeenLastCalledWith(
          expect.anything(),
          expect.objectContaining({
            query: expect.objectContaining({
              topEvents: 5,
              field: ['field', 'value'],
            }),
          })
        );

        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            loading: false,
            results: [
              {
                seriesName: 'field,value',
                data: [
                  {name: 123 * 1000, value: 123},
                  {name: 456 * 1000, value: 123},
                  {name: 789 * 1000, value: 123},
                ],
              },
            ],
          })
        );
      });
    });
  });

  describe('out of retention', function () {
    beforeEach(function () {
      eventsStatsMock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/events-stats/',
        statusCode: 400,
        body: {
          detail: 'too much data',
        },
      });
    });

    it('handles 400 error', async function () {
      render(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);

      await waitFor(() => {
        expect(mock).toHaveBeenLastCalledWith(
          expect.objectContaining({
            expired: true,
            errored: true,
          })
        );
      });
    });
  });
});

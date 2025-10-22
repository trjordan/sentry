import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import {doEventsRequest} from 'app/actionCreators/events';
import EventsRequest from 'app/components/charts/eventsRequest';

const COUNT_OBJ = {
  count: 123,
};

jest.mock('app/actionCreators/events', () => ({
  doEventsRequest: jest.fn(),
}));

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

  let rerender;

  describe('with props changes', function () {
    beforeAll(function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          data: [[new Date(), [COUNT_OBJ]]],
        })
      );
      const result = renderWithTheme(<EventsRequest {...DEFAULTS}>{mock}</EventsRequest>);
      rerender = result.rerender;
    });

    it('makes requests', async function () {
      expect(mock).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          loading: true,
        })
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,
          timeseriesData: [
            {
              seriesName: expect.anything(),
              data: [
                expect.objectContaining({
                  name: expect.any(Number),
                  value: 123,
                }),
              ],
            },
          ],
          originalTimeseriesData: [[expect.anything(), expect.anything()]],
        })
      );

      expect(doEventsRequest).toHaveBeenCalled();
    });

    it('makes a new request if projects prop changes', async function () {
      doEventsRequest.mockClear();

      rerender(
        <EventsRequest {...DEFAULTS} projects={[123]}>
          {mock}
        </EventsRequest>
      );
      await tick();
      expect(doEventsRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          projects: [123],
        })
      );
    });

    it('makes a new request if environments prop changes', async function () {
      doEventsRequest.mockClear();

      rerender(
        <EventsRequest {...DEFAULTS} environments={['dev']}>
          {mock}
        </EventsRequest>
      );
      await tick();
      expect(doEventsRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          environments: ['dev'],
        })
      );
    });

    it('makes a new request if period prop changes', async function () {
      doEventsRequest.mockClear();

      rerender(
        <EventsRequest {...DEFAULTS} period="7d">
          {mock}
        </EventsRequest>
      );
      await tick();
      expect(doEventsRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          period: '7d',
        })
      );
    });
  });

  describe('transforms', function () {
    beforeEach(function () {
      doEventsRequest.mockClear();
    });

    it('expands period in query if `includePrevious`', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          data: [
            [
              new Date(),
              [
                {...COUNT_OBJ, count: 321},
                {...COUNT_OBJ, count: 79},
              ],
            ],
            [new Date(), [COUNT_OBJ]],
          ],
        })
      );
      renderWithTheme(
        <EventsRequest {...DEFAULTS} includePrevious>
          {mock}
        </EventsRequest>
      );

      await tick();
      // actionCreator handles expanding the period when calling the API
      expect(doEventsRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          period: '24h',
        })
      );

      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,
          allTimeseriesData: [
            [
              expect.anything(),
              [
                expect.objectContaining({count: 321}),
                expect.objectContaining({count: 79}),
              ],
            ],
            [expect.anything(), [expect.objectContaining({count: 123})]],
          ],
          timeseriesData: [
            {
              seriesName: expect.anything(),
              data: [
                expect.objectContaining({
                  name: expect.anything(),
                  value: 123,
                }),
              ],
            },
          ],
          previousTimeseriesData: {
            seriesName: 'Previous',
            data: [
              expect.objectContaining({
                name: expect.anything(),
                value: 400,
              }),
            ],
          },

          originalTimeseriesData: [
            [expect.anything(), [expect.objectContaining({count: 123})]],
          ],

          originalPreviousTimeseriesData: [
            [
              expect.anything(),
              [
                expect.objectContaining({count: 321}),
                expect.objectContaining({count: 79}),
              ],
            ],
          ],
        })
      );
    });

    it('aggregates counts per timestamp only when `includeTimeAggregation` prop is true', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          data: [[new Date(), [COUNT_OBJ, {...COUNT_OBJ, count: 100}]]],
        })
      );

      const {rerender: rerenderLocal} = renderWithTheme(
        <EventsRequest {...DEFAULTS} includeTimeseries>
          {mock}
        </EventsRequest>
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          timeAggregatedData: {},
        })
      );

      rerenderLocal(
        <EventsRequest
          {...DEFAULTS}
          includeTimeseries
          includeTimeAggregation
          timeAggregationSeriesName="aggregated series"
        >
          {mock}
        </EventsRequest>
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          timeAggregatedData: {
            seriesName: 'aggregated series',
            data: [{name: expect.anything(), value: 223}],
          },
        })
      );
    });

    it('aggregates all counts per timestamp when category name identical', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          data: [[new Date(), [COUNT_OBJ, {...COUNT_OBJ, count: 100}]]],
        })
      );

      const {rerender: rerenderLocal2} = renderWithTheme(
        <EventsRequest {...DEFAULTS} includeTimeseries>
          {mock}
        </EventsRequest>
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          timeAggregatedData: {},
        })
      );

      rerenderLocal2(
        <EventsRequest
          {...DEFAULTS}
          includeTimeseries
          includeTimeAggregation
          timeAggregationSeriesName="aggregated series"
        >
          {mock}
        </EventsRequest>
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          timeAggregatedData: {
            seriesName: 'aggregated series',
            data: [{name: expect.anything(), value: 223}],
          },
        })
      );
    });
  });

  describe('yAxis', function () {
    beforeEach(function () {
      doEventsRequest.mockClear();
    });

    it('supports yAxis', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          data: [
            [
              new Date(),
              [
                {...COUNT_OBJ, count: 321},
                {...COUNT_OBJ, count: 79},
              ],
            ],
            [new Date(), [COUNT_OBJ]],
          ],
        })
      );

      renderWithTheme(
        <EventsRequest {...DEFAULTS} includePrevious yAxis="apdex()">
          {mock}
        </EventsRequest>
      );

      await tick();
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,
          allTimeseriesData: [
            [
              expect.anything(),
              [
                expect.objectContaining({count: 321}),
                expect.objectContaining({count: 79}),
              ],
            ],
            [expect.anything(), [expect.objectContaining({count: 123})]],
          ],
          timeseriesData: [
            {
              seriesName: expect.anything(),
              data: [
                expect.objectContaining({
                  name: expect.anything(),
                  value: 123,
                }),
              ],
            },
          ],
          previousTimeseriesData: {
            seriesName: 'Previous',
            data: [
              expect.objectContaining({
                name: expect.anything(),
                value: 400,
              }),
            ],
          },

          originalTimeseriesData: [
            [expect.anything(), [expect.objectContaining({count: 123})]],
          ],

          originalPreviousTimeseriesData: [
            [
              expect.anything(),
              [
                expect.objectContaining({count: 321}),
                expect.objectContaining({count: 79}),
              ],
            ],
          ],
        })
      );
    });

    it('supports multiple yAxis', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          'epm()': {
            data: [
              [
                new Date(),
                [
                  {...COUNT_OBJ, count: 321},
                  {...COUNT_OBJ, count: 79},
                ],
              ],
              [new Date(), [COUNT_OBJ]],
            ],
          },
          'apdex()': {
            data: [
              [
                new Date(),
                [
                  {...COUNT_OBJ, count: 321},
                  {...COUNT_OBJ, count: 79},
                ],
              ],
              [new Date(), [COUNT_OBJ]],
            ],
          },
        })
      );

      renderWithTheme(
        <EventsRequest {...DEFAULTS} includePrevious yAxis={['apdex()', 'epm()']}>
          {mock}
        </EventsRequest>
      );

      await tick();
      const generateExpected = name => {
        return {
          seriesName: name,
          data: [
            {name: expect.anything(), value: 400},
            {name: expect.anything(), value: 123},
          ],
        };
      };

      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,

          results: [generateExpected('epm()'), generateExpected('apdex()')],
        })
      );
    });
  });

  describe('topEvents', function () {
    beforeEach(function () {
      doEventsRequest.mockClear();
    });

    it('supports topEvents parameter', async function () {
      doEventsRequest.mockImplementation(() =>
        Promise.resolve({
          'project1,error': {
            data: [
              [
                new Date(),
                [
                  {...COUNT_OBJ, count: 321},
                  {...COUNT_OBJ, count: 79},
                ],
              ],
              [new Date(), [COUNT_OBJ]],
            ],
          },
          'project1,warning': {
            data: [
              [
                new Date(),
                [
                  {...COUNT_OBJ, count: 321},
                  {...COUNT_OBJ, count: 79},
                ],
              ],
              [new Date(), [COUNT_OBJ]],
            ],
          },
        })
      );

      renderWithTheme(
        <EventsRequest
          {...DEFAULTS}
          includePrevious
          field={['project', 'level']}
          topEvents={2}
        >
          {mock}
        </EventsRequest>
      );

      await tick();
      const generateExpected = name => {
        return {
          seriesName: name,
          data: [
            {name: expect.anything(), value: 400},
            {name: expect.anything(), value: 123},
          ],
        };
      };

      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          loading: false,

          results: [
            generateExpected('project1,error'),
            generateExpected('project1,warning'),
          ],
        })
      );
    });
  });

  describe('out of retention', function () {
    beforeEach(function () {
      doEventsRequest.mockClear();
    });

    it('does not make request', async function () {
      renderWithTheme(
        <EventsRequest {...DEFAULTS} expired>
          {mock}
        </EventsRequest>
      );
      expect(doEventsRequest).not.toHaveBeenCalled();
    });

    it('errors', async function () {
      renderWithTheme(
        <EventsRequest {...DEFAULTS} expired>
          {mock}
        </EventsRequest>
      );
      expect(mock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          expired: true,
          errored: true,
        })
      );
    });
  });
});

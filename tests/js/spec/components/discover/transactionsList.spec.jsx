import React from 'react';

import {renderWithTheme, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import TransactionsList from 'app/components/discover/transactionsList';
import {t} from 'app/locale';
import EventView from 'app/utils/discover/eventView';

describe('TransactionsList', function () {
  let api;
  let location;
  let organization;
  let project;
  let eventView;
  let options;
  let handleDropdownChange;

  beforeEach(function () {
    organization = TestStubs.Organization();
    project = TestStubs.Project();
    api = new Client();
    location = {
      pathname: '/',
      query: {},
    };
    handleDropdownChange = jest.fn();
  });

  describe('Basic', function () {
    let generateLink;

    beforeEach(function () {
      eventView = EventView.fromSavedQuery({
        id: '',
        name: 'test query',
        version: 2,
        fields: ['transaction', 'count()'],
        projects: [project.id],
      });
      options = [
        {
          sort: {kind: 'asc', field: 'transaction'},
          value: 'name',
          label: t('Transactions'),
        },
        {
          sort: {kind: 'desc', field: 'count'},
          value: 'count',
          label: t('Failing Transactions'),
        },
      ];
      generateLink = {
        transaction: (org, row, query) => ({
          pathname: `/${org.slug}`,
          query: {
            ...query,
            transaction: row.transaction,
            count: row.count,
          },
        }),
      };

      MockApiClient.addMockResponse(
        {
          url: `/organizations/${organization.slug}/eventsv2/`,
          body: {
            meta: {transaction: 'string', count: 'number'},
            data: [
              {transaction: '/a', count: 100},
              {transaction: '/b', count: 1000},
            ],
          },
        },
        {
          predicate: (_, opts) => opts?.query?.sort === 'transaction',
        }
      );
      MockApiClient.addMockResponse(
        {
          url: `/organizations/${organization.slug}/eventsv2/`,
          body: {
            meta: {transaction: 'string', count: 'number'},
            data: [
              {transaction: '/b', count: 1000},
              {transaction: '/a', count: 100},
            ],
          },
        },
        {
          predicate: (_, opts) => opts?.query?.sort === '-count',
        }
      );
      MockApiClient.addMockResponse({
        url: `/organizations/${organization.slug}/events-trends/`,
        body: {
          meta: {
            transaction: 'string',
            trend_percentage: 'percentage',
            trend_difference: 'number',
          },
          data: [
            {transaction: '/a', 'trend_percentage()': 1.25, 'trend_difference()': 25},
            {transaction: '/b', 'trend_percentage()': 1.05, 'trend_difference()': 5},
          ],
        },
      });
    });

    it('renders basic UI components', async function () {
      renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', {name: /transactions/i})).toBeInTheDocument();
      });

      expect(screen.getByRole('button', {name: /transactions/i})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /discover/i})).toBeInTheDocument();
      expect(screen.getByText('/a')).toBeInTheDocument();
      expect(screen.getByText('/b')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    it('renders a trend view', async function () {
      options.push({
        sort: {kind: 'desc', field: 'trend_percentage()'},
        value: 'regression',
        label: t('Trending Regressions'),
        trendType: 'regression',
      });
      renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          trendView={eventView}
          selected={options[2]}
          options={options}
          handleDropdownChange={handleDropdownChange}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', {name: /trending regressions/i})
        ).toBeInTheDocument();
      });

      expect(
        screen.getByRole('button', {name: /trending regressions/i})
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', {name: /discover/i})).not.toBeInTheDocument();
      expect(screen.getByText('/a')).toBeInTheDocument();
      expect(screen.getByText('/b')).toBeInTheDocument();
    });

    it('renders default titles', async function () {
      renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('transaction')).toBeInTheDocument();
      });

      expect(screen.getByText('transaction')).toBeInTheDocument();
      expect(screen.getByText('count()')).toBeInTheDocument();
    });

    it('renders custom titles', async function () {
      renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
          titles={['foo', 'bar']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('foo')).toBeInTheDocument();
      });

      expect(screen.getByText('foo')).toBeInTheDocument();
      expect(screen.getByText('bar')).toBeInTheDocument();
    });

    it('allows users to change the sort in the dropdown', async function () {
      const {rerender} = renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('/a')).toBeInTheDocument();
      });

      // initial sort is ascending by transaction name
      expect(screen.getByText('/a')).toBeInTheDocument();
      expect(screen.getByText('/b')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();

      // Re-render with updated selected option
      rerender(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[1]}
          options={options}
          handleDropdownChange={handleDropdownChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('/b')).toBeInTheDocument();
      });

      // now the sort is descending by count - data should be re-fetched
      expect(screen.getByText('/b')).toBeInTheDocument();
      expect(screen.getByText('/a')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });

    it('generates link for the transaction cell', async function () {
      const {container} = renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
          generateLink={generateLink}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('/a')).toBeInTheDocument();
      });

      // Use querySelectorAll since Link components without router context may not have role="link"
      const links = container.querySelectorAll('a[data-test-id^="view-"]');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveTextContent('/a');
      expect(links[1]).toHaveTextContent('/b');
    });

    it('handles forceLoading correctly', async function () {
      const {rerender} = renderWithTheme(
        <TransactionsList
          api={null}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
          forceLoading
        />
      );

      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

      rerender(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
          forceLoading={false}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
      expect(screen.getByRole('button', {name: /transactions/i})).toBeInTheDocument();
      expect(screen.getByRole('button', {name: /discover/i})).toBeInTheDocument();
      expect(screen.getByText('/a')).toBeInTheDocument();
      expect(screen.getByText('/b')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  describe('Baseline', function () {
    beforeEach(function () {
      organization = TestStubs.Organization({
        features: ['transaction-comparison'],
      });
      eventView = EventView.fromSavedQuery({
        id: '',
        name: 'baseline query',
        version: 2,
        fields: ['id', 'transaction.duration'],
        projects: [project.id],
      });
      options = [
        {
          sort: {kind: 'desc', field: 'transaction.duration'},
          value: 'slow',
          label: t('Slow Transactions'),
        },
      ];

      MockApiClient.addMockResponse({
        url: `/organizations/${organization.slug}/eventsv2/`,
        body: {
          meta: {id: 'string', 'transaction.duration': 'duration'},
          data: [
            {id: 'a', 'transaction.duration': 123},
            {id: 'c', 'transaction.duration': 12345},
          ],
        },
      });
      MockApiClient.addMockResponse({
        url: `/organizations/${organization.slug}/event-baseline/`,
        body: {
          'transaction.duration': 1234,
        },
      });
    });

    it('renders baseline comparison correctly', async function () {
      renderWithTheme(
        <TransactionsList
          api={api}
          location={location}
          organization={organization}
          eventView={eventView}
          selected={options[0]}
          options={options}
          handleDropdownChange={handleDropdownChange}
          baseline="/"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Compared to Baseline')).toBeInTheDocument();
      });

      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('transaction.duration')).toBeInTheDocument();
      expect(screen.getByText('Compared to Baseline')).toBeInTheDocument();

      const baselineCells = screen.getAllByTestId('baseline-cell');
      expect(baselineCells).toHaveLength(2);
      expect(baselineCells[0]).toHaveTextContent('1.11 seconds faster');
      expect(baselineCells[1]).toHaveTextContent('11.11 seconds slower');
    });
  });
});

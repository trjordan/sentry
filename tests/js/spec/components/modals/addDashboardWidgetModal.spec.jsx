import React from 'react';

import {renderWithTheme, screen, waitFor, within, userEvent, selectByLabel, tick} from 'sentry-test/reactTestingLibrary';
import {initializeOrg} from 'sentry-test/initializeOrg';

import AddDashboardWidgetModal from 'app/components/modals/addDashboardWidgetModal';
import TagStore from 'app/stores/tagStore';
import GlobalSelectionStore from 'app/stores/globalSelectionStore';

const stubEl = props => <div>{props.children}</div>;

describe('Modals -> AddDashboardWidgetModal', function () {
  const initialData = initializeOrg({
    organization: {
      features: ['performance-view', 'discover-query'],
      apdexThreshold: 400,
    },
  });
  const tags = [
    {name: 'browser.name', key: 'browser.name'},
    {name: 'custom-field', key: 'custom-field'},
  ];

  let eventsStatsMock;

  beforeEach(function () {
    // Set up GlobalSelectionStore for withGlobalSelection HOC
    GlobalSelectionStore.reset();

    TagStore.onLoadTagsSuccess(tags);
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/dashboards/widgets/',
      method: 'POST',
      statusCode: 200,
      body: [],
    });
    eventsStatsMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-stats/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/eventsv2/',
      body: {data: [{'event.type': 'error'}], meta: {'event.type': 'string'}},
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/events-geo/',
      body: {data: [], meta: {}},
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      body: [],
    });
  });

  afterEach(() => {
    MockApiClient.clearMockResponses();
  });

  it('can update the title', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    const titleInput = screen.getByRole('textbox', {name: /title/i});
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Unique Users');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.title).toEqual('Unique Users');
    });
  });

  it('can add conditions', async function () {
    jest.useFakeTimers();
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Change the search text on the first query.
    const searchInput = document.querySelector('#smart-search-input');
    await userEvent.type(searchInput, 'color:blue');
    searchInput.blur();

    jest.runAllTimers();
    jest.useRealTimers();

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].conditions).toEqual('color:blue');
    });
  });

  it('can choose a field', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // No delete button as there is only one field.
    expect(screen.queryByRole('button', {name: /delete/i})).not.toBeInTheDocument();

    // Select p95 field
    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'p95(…)');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['p95(transaction.duration)']);
    });
  });

  it('can add additional fields', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Click the add button
    const addButton = screen.getByRole('button', {name: 'Add Overlay'});
    await userEvent.click(addButton);

    // Should be another field input.
    await waitFor(() => {
      expect(screen.getAllByRole('textbox', {name: /field/i})).toHaveLength(2);
    });

    const fieldSelects = screen.getAllByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelects[1], 'p95(…)');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['count()', 'p95(transaction.duration)']);
    });
  });

  it('can add and delete additional queries', async function () {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/event.type/values/',
      body: [{count: 2, name: 'Nvidia 1080ti'}],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      method: 'POST',
      body: [],
    });

    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Set first query search conditions
    const searchInputs = document.querySelectorAll('#smart-search-input');
    await userEvent.type(searchInputs[0], 'event.type:transaction');
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('event.type:transaction')).toBeInTheDocument();
    });

    // Set first query legend alias
    const legendInputs = screen.getAllByPlaceholderText('Legend Alias');
    await userEvent.type(legendInputs[0], 'Transactions');

    // Click the "Add Query" button twice
    const addQueryButtons = screen.getAllByRole('button', {name: 'Add Query'});
    await userEvent.click(addQueryButtons[0]);
    
    await waitFor(() => {
      expect(screen.getAllByRole('button', {name: 'Add Query'})).toHaveLength(1);
    });
    
    await userEvent.click(screen.getByRole('button', {name: 'Add Query'}));

    // Expect three search bars
    await waitFor(() => {
      expect(document.querySelectorAll('#smart-search-input')).toHaveLength(3);
    });

    // Expect "Add Query" button to be hidden since we're limited to at most 3 search conditions
    await waitFor(() => {
      expect(screen.queryByRole('button', {name: 'Add Query'})).not.toBeInTheDocument();
    });

    // Delete second query
    const removeButtons = screen.getAllByRole('button', {name: 'Remove query'});
    expect(removeButtons).toHaveLength(3);
    await userEvent.click(removeButtons[1]);

    // Expect "Add Query" button to be shown again
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Add Query'})).toBeInTheDocument();
    });

    // Set second query search conditions
    const updatedSearchInputs = document.querySelectorAll('#smart-search-input');
    await userEvent.type(updatedSearchInputs[1], 'event.type:error');
    await userEvent.keyboard('{Enter}');

    // Set second query legend alias
    const updatedLegendInputs = screen.getAllByPlaceholderText('Legend Alias');
    await userEvent.type(updatedLegendInputs[1], 'Errors');

    // Save widget
    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(2);
      expect(widget.queries[0]).toMatchObject({
        name: 'Transactions',
        conditions: 'event.type:transaction',
        fields: ['count()'],
      });
      expect(widget.queries[1]).toMatchObject({
        name: 'Errors',
        conditions: 'event.type:error',
        fields: ['count()'],
      });
    });
  });

  it('can respond to validation feedback', async function () {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/dashboards/widgets/',
      method: 'POST',
      statusCode: 400,
      body: {
        title: ['This field is required'],
        queries: [{conditions: ['Invalid value']}],
      },
    });

    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      // API request should fail and not add widget.
      expect(widget).toBeUndefined();
    });

    // Check for error messages
    await waitFor(() => {
      const errors = screen.getAllByText(/required|invalid/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('can edit a widget', async function () {
    let widget = {
      id: '9',
      title: 'Errors over time',
      interval: '5m',
      displayType: 'line',
      queries: [
        {
          id: '9',
          name: 'errors',
          conditions: 'event.type:error',
          fields: ['count()', 'count_unique(id)'],
        },
        {
          id: '9',
          name: 'csp',
          conditions: 'event.type:csp',
          fields: ['count()', 'count_unique(id)'],
        },
      ],
    };
    const onAdd = jest.fn();
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        widget={widget}
        onAddWidget={onAdd}
        onUpdateWidget={data => {
          widget = data;
        }}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Should be in edit 'mode'
    await waitFor(() => {
      expect(screen.getByRole('heading', {name: /edit/i})).toBeInTheDocument();
    });

    // Should set widget data up.
    const titleInput = screen.getByRole('textbox', {name: /title/i});
    expect(titleInput).toHaveValue(widget.title);

    // Expect two query field configurations
    await waitFor(() => {
      expect(document.querySelectorAll('#smart-search-input')).toHaveLength(2);
    });

    // Expect events-stats endpoint to be called for each search conditions with
    // the same y-axis parameters
    expect(eventsStatsMock).toHaveBeenNthCalledWith(
      1,
      '/organizations/org-slug/events-stats/',
      expect.objectContaining({
        query: expect.objectContaining({
          query: 'event.type:error',
          yAxis: ['count()', 'count_unique(id)'],
        }),
      })
    );
    expect(eventsStatsMock).toHaveBeenNthCalledWith(
      2,
      '/organizations/org-slug/events-stats/',
      expect.objectContaining({
        query: expect.objectContaining({
          query: 'event.type:csp',
          yAxis: ['count()', 'count_unique(id)'],
        }),
      })
    );

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'New title');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onAdd).not.toHaveBeenCalled();
      expect(widget.title).toEqual('New title');
    });

    expect(eventsStatsMock).toHaveBeenCalledTimes(2);
  });

  it('renders column inputs for table widgets', async function () {
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/eventsv2/',
      method: 'GET',
      statusCode: 200,
      body: {
        meta: {},
        data: [],
      },
    });

    let widget = {
      id: '9',
      title: 'sdk usage',
      interval: '5m',
      displayType: 'table',
      queries: [
        {
          id: '9',
          name: 'errors',
          conditions: 'event.type:error',
          fields: ['sdk.name', 'count()'],
        },
      ],
    };
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        widget={widget}
        onAddWidget={jest.fn()}
        onUpdateWidget={data => {
          widget = data;
        }}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Should be in edit 'mode'
    await waitFor(() => {
      expect(screen.getByRole('heading', {name: /edit/i})).toBeInTheDocument();
    });

    // Should set widget data up.
    const titleInput = screen.getByRole('textbox', {name: /title/i});
    expect(titleInput).toHaveValue(widget.title);

    // Add a column
    const addColumnButton = screen.getByRole('button', {name: 'Add a Column'});
    await userEvent.click(addColumnButton);

    await waitFor(() => {
      expect(screen.getAllByRole('textbox', {name: /field/i}).length).toBeGreaterThanOrEqual(2);
    });

    const fieldSelects = screen.getAllByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelects[2], 'trace');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      // A new field should be added.
      expect(widget.queries[0].fields).toHaveLength(3);
      expect(widget.queries[0].fields[2]).toEqual('trace');
    });
  });

  it('uses count() columns if there are no aggregate fields remaining when switching from table to chart', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Select Table display
    const displayTypeSelect = screen.getByRole('textbox', {name: /display type/i});
    await selectEvent.select(displayTypeSelect, 'Table');

    // Add field column
    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'event.type');

    // Verify the field value
    await waitFor(() => {
      const displayedInput = screen.getByDisplayValue(/event\.type/i);
      expect(displayedInput).toBeInTheDocument();
    });

    // Select Line chart display
    await selectEvent.select(displayTypeSelect, 'Line Chart');

    // Expect event.type field to be converted to count()
    await waitFor(() => {
      expect(screen.getByDisplayValue(/count/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['count()']);
    });
  });

  it('should filter out non-aggregate fields when switching from table to chart', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Select Table display
    const displayTypeSelect = screen.getByRole('textbox', {name: /display type/i});
    await selectEvent.select(displayTypeSelect, 'Table');

    // Click the add button
    const addButton = screen.getByRole('button', {name: 'Add a Column'});
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getAllByRole('textbox', {name: /field/i})).toHaveLength(2);
    });

    // Add columns
    const fieldSelects = screen.getAllByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelects[0], 'event.type');
    await selectEvent.select(fieldSelects[1], 'p95(…)');

    // Select Line chart display
    await selectEvent.select(displayTypeSelect, 'Line Chart');

    // Expect only one field (the aggregate) to remain
    await waitFor(() => {
      expect(screen.getAllByRole('textbox', {name: /field/i})).toHaveLength(1);
    });

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['p95(transaction.duration)']);
    });
  });

  it('should filter non-legal y-axis choices for timeseries widget charts', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'any(…)');

    // Expect user.display to not be an available parameter option for any()
    // for line (timeseries) widget charts
    await waitFor(async () => {
      const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
      await selectEvent.openMenu(parameterSelect);
      expect(screen.queryByText('user.display')).not.toBeInTheDocument();
    });

    // Be able to choose a numeric-like option for any()
    const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
    await selectEvent.select(parameterSelect, 'measurements.lcp');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.displayType).toEqual('line');
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['any(measurements.lcp)']);
    });
  });

  it('should not filter y-axis choices for big number widget charts', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Select Big number display
    const displayTypeSelect = screen.getByRole('textbox', {name: /display type/i});
    await selectEvent.select(displayTypeSelect, 'Big Number');

    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'count_unique(…)');

    // Be able to choose a non numeric-like option for count_unique()
    const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
    await selectEvent.select(parameterSelect, 'user.display');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.displayType).toEqual('big_number');
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['count_unique(user.display)']);
    });
  });

  it('should filter y-axis choices for world map widget charts', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Select World Map display
    const displayTypeSelect = screen.getByRole('textbox', {name: /display type/i});
    await selectEvent.select(displayTypeSelect, 'World Map');

    // Choose any()
    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'any(…)');

    // user.display should be filtered out for any()
    await waitFor(async () => {
      const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
      await selectEvent.openMenu(parameterSelect);
      expect(screen.queryByText('user.display')).not.toBeInTheDocument();
    });

    const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
    await selectEvent.select(parameterSelect, 'measurements.lcp');

    // Choose count_unique()
    await selectEvent.select(fieldSelect, 'count_unique(…)');

    // user.display not should be filtered out for count_unique()
    await selectEvent.select(parameterSelect, 'user.display');

    // Be able to choose a numeric-like option
    await selectEvent.select(parameterSelect, 'measurements.lcp');

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.displayType).toEqual('world_map');
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['count_unique(measurements.lcp)']);
    });
  });

  it('should filter y-axis choices by output type when switching from big number to line chart', async function () {
    let widget = undefined;
    
    render(
      <AddDashboardWidgetModal
        Header={stubEl}
        Footer={stubEl}
        Body={stubEl}
        organization={initialData.organization}
        onAddWidget={data => (widget = data)}
        closeModal={() => void 0}
      />,
      {context: initialData.routerContext}
    );

    // Select Big Number display
    const displayTypeSelect = screen.getByRole('textbox', {name: /display type/i});
    await selectEvent.select(displayTypeSelect, 'Big Number');

    // Choose any()
    const fieldSelect = screen.getByRole('textbox', {name: /field/i});
    await selectEvent.select(fieldSelect, 'any(…)');

    const parameterSelect = screen.getByRole('textbox', {name: /parameter/i});
    await selectEvent.select(parameterSelect, 'id');

    // Select Line chart display
    await selectEvent.select(displayTypeSelect, 'Line Chart');

    // Expect any(id) field to be converted to count()
    await waitFor(() => {
      expect(screen.getByDisplayValue(/count/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByTestId('add-widget');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(widget.displayType).toEqual('line');
      expect(widget.queries).toHaveLength(1);
      expect(widget.queries[0].fields).toEqual(['count()']);
    });
  });
});

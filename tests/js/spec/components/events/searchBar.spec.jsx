import React from 'react';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import SearchBar from 'app/components/events/searchBar';
import TagStore from 'app/stores/tagStore';

const focusInput = container => {
  const input = container.querySelector('input[name="query"]');
  // Use fireEvent.click to avoid createRange issue with userEvent
  fireEvent.click(input);
  return input;
};

const selectFirstAutocompleteItem = async container => {
  focusInput(container);

  await waitFor(() => {
    expect(
      container.querySelector('[data-test-id="search-autocomplete-item"]')
    ).toBeInTheDocument();
  });

  const firstItem = container.querySelector('[data-test-id="search-autocomplete-item"]');
  // Use fireEvent.click to avoid createRange issue with userEvent
  fireEvent.click(firstItem);
};

const setQuery = async (container, query) => {
  const input = container.querySelector('input');
  await userEvent.clear(input);
  await userEvent.type(input, query);
};

describe('Events > SearchBar', function () {
  let tagValuesMock;
  let organization;
  let props;
  let location;

  beforeEach(function () {
    organization = TestStubs.Organization();
    location = {
      pathname: '/organizations/org-slug/issues/',
      query: {},
    };

    props = {
      organization,
      projectIds: [1, 2],
      location,
    };
    TagStore.reset();
    TagStore.onLoadTagsSuccess([
      {count: 3, key: 'gpu', name: 'Gpu'},
      {count: 3, key: 'mytag', name: 'Mytag'},
      {count: 0, key: 'browser', name: 'Browser'},
    ]);

    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      method: 'POST',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      body: [],
    });

    tagValuesMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/gpu/values/',
      body: [{count: 2, name: 'Nvidia 1080ti'}],
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('autocompletes measurement names', async function () {
    const initializationObj = initializeOrg({
      organization: {
        features: ['performance-view'],
      },
    });
    props.organization = initializationObj.organization;
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, 'fcp');

    await waitFor(() => {
      const items = container.querySelectorAll(
        '[data-test-id="search-autocomplete-item"]'
      );
      const measurementItem = Array.from(items).find(item =>
        item.textContent.includes('measurements.fcp:')
      );
      expect(measurementItem).toBeTruthy();
    });
  });

  it('autocompletes has suggestions correctly', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, 'has:');

    await waitFor(() => {
      expect(screen.getByText('gpu')).toBeInTheDocument();
    });

    await selectFirstAutocompleteItem(container);

    // the trailing space is important here as without it, autocomplete suggestions will
    // try to complete `has:gpu` thinking the token has not ended yet
    const input = container.querySelector('input');
    expect(input.value).toBe('has:gpu ');
  });

  it('searches and selects an event field value', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, 'gpu:');

    await waitFor(() => {
      expect(tagValuesMock).toHaveBeenCalledWith(
        '/organizations/org-slug/tags/gpu/values/',
        expect.objectContaining({
          query: {project: ['1', '2'], statsPeriod: '14d', includeTransactions: '1'},
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('"Nvidia 1080ti"')).toBeInTheDocument();
    });

    await selectFirstAutocompleteItem(container);

    const input = container.querySelector('input');
    expect(input.value).toBe('gpu:"Nvidia 1080ti" ');
  });

  it('if `useFormWrapper` is false, pressing enter when there are no dropdown items selected should blur and call `onSearch` callback', async function () {
    const onBlur = jest.fn();
    const onSearch = jest.fn();
    const {container} = renderWithTheme(
      <SearchBar {...props} useFormWrapper={false} onSearch={onSearch} onBlur={onBlur} />
    );

    await setQuery(container, 'gpu:');

    await waitFor(() => {
      expect(tagValuesMock).toHaveBeenCalledWith(
        '/organizations/org-slug/tags/gpu/values/',
        expect.objectContaining({
          query: {project: ['1', '2'], statsPeriod: '14d', includeTransactions: '1'},
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('"Nvidia 1080ti"')).toBeInTheDocument();
    });

    const input = container.querySelector('input');
    fireEvent.keyDown(input, {key: 'Enter'});

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('filters dropdown to accomodate for num characters left in query', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} maxQueryLength={5} />);

    await setQuery(container, 'g');

    await waitFor(() => {
      const items = container.querySelectorAll(
        '[data-test-id="search-autocomplete-item"]'
      );
      expect(items).toHaveLength(1);
    });
  });

  it('returns zero dropdown suggestions if out of characters', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} maxQueryLength={2} />);

    await setQuery(container, 'g');

    await waitFor(() => {
      const items = container.querySelectorAll(
        '[data-test-id="search-autocomplete-item"]'
      );
      expect(items).toHaveLength(0);
    });
  });

  it('sets maxLength property', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} maxQueryLength={10} />);

    const input = container.querySelector('input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('does not requery for event field values if query does not change', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, 'gpu:');

    await waitFor(() => {
      expect(tagValuesMock).toHaveBeenCalledTimes(1);
    });

    // Click will fire "updateAutocompleteItems"
    const input = container.querySelector('input');
    // Use fireEvent.click to avoid createRange issue with userEvent
    fireEvent.click(input);

    await waitFor(() => {
      expect(tagValuesMock).toHaveBeenCalledTimes(1);
    });
  });

  it('removes highlight when query is empty', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, 'gpu');

    await waitFor(() => {
      const strong = container.querySelector('strong');
      expect(strong).toHaveTextContent('gpu');
    });

    // Should have nothing highlighted
    const input = container.querySelector('input');
    await userEvent.clear(input);

    await waitFor(() => {
      const strong = container.querySelector('strong');
      expect(strong).not.toBeInTheDocument();
    });
  });

  it('ignores negation ("!") at the beginning of search term', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, '!gp');

    await waitFor(() => {
      const items = container.querySelectorAll(
        '[data-test-id="search-autocomplete-item"]'
      );
      expect(items).toHaveLength(1);
      expect(items[0]).toHaveTextContent('gpu:');
    });
  });

  it('ignores wildcard ("*") at the beginning of tag value query', async function () {
    const {container} = renderWithTheme(<SearchBar {...props} />);

    await setQuery(container, '!gpu:*');

    await waitFor(() => {
      expect(tagValuesMock).toHaveBeenCalledWith(
        '/organizations/org-slug/tags/gpu/values/',
        expect.objectContaining({
          query: {project: ['1', '2'], statsPeriod: '14d', includeTransactions: '1'},
        })
      );
    });

    await selectFirstAutocompleteItem(container);

    const input = container.querySelector('input');
    expect(input.value).toBe('!gpu:"Nvidia 1080ti" ');
  });

  it('stops searching after no values are returned', async function () {
    const emptyTagValuesMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/browser/values/',
      body: [],
    });

    const {container} = renderWithTheme(<SearchBar {...props} />);

    // Do 3 searches, the first will find nothing, so no more requests should be made
    const input = container.querySelector('input');
    await userEvent.type(input, 'browser:Nothing');

    await waitFor(() => {
      expect(emptyTagValuesMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const callsAfterFirstSearch = emptyTagValuesMock.mock.calls.length;

    // Continue typing without clearing - this should not trigger new API calls
    await userEvent.type(input, 'E');
    await userEvent.type(input, 'ls');

    // Give it a moment to potentially make more calls (which it shouldn't)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Call count should be the same as after the first search
    expect(emptyTagValuesMock).toHaveBeenCalledTimes(callsAfterFirstSearch);
  });

  it('continues searching after no values if query changes', async function () {
    const emptyTagValuesMock = MockApiClient.addMockResponse({
      url: '/organizations/org-slug/tags/browser/values/',
      body: [],
    });

    const {container} = renderWithTheme(<SearchBar {...props} />);

    const input = container.querySelector('input');
    await userEvent.type(input, 'browser:Nothing');

    await waitFor(() => {
      expect(emptyTagValuesMock.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    const callsAfterFirstSearch = emptyTagValuesMock.mock.calls.length;

    // Clear and start a new search - this should trigger a new API call
    await userEvent.clear(input);
    await userEvent.type(input, 'browser:Something');

    await waitFor(() => {
      expect(emptyTagValuesMock.mock.calls.length).toBeGreaterThan(callsAfterFirstSearch);
    });
  });
});

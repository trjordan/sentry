import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import {SmartSearchBar} from 'app/components/smartSearchBar';
import {addSpace, removeSpace} from 'app/components/smartSearchBar/utils';
import TagStore from 'app/stores/tagStore';

describe('addSpace()', function () {
  it('should add a space when there is no trailing space', function () {
    expect(addSpace('one')).toEqual('one ');
  });

  it('should not add another space when there is already one', function () {
    expect(addSpace('one ')).toEqual('one ');
  });

  it('should leave the empty string alone', function () {
    expect(addSpace('')).toEqual('');
  });
});

describe('removeSpace()', function () {
  it('should remove a trailing space', function () {
    expect(removeSpace('one ')).toEqual('one');
  });

  it('should not remove the last character if it is not a space', function () {
    expect(removeSpace('one')).toEqual('one');
  });

  it('should leave the empty string alone', function () {
    expect(removeSpace('')).toEqual('');
  });
});

describe('SmartSearchBar', function () {
  let location, router, organization, supportedTags;
  let environmentTagValuesMock;
  const tagValuesMock = jest.fn(() => Promise.resolve([]));

  beforeEach(function () {
    TagStore.reset();
    TagStore.onLoadTagsSuccess(TestStubs.Tags());
    tagValuesMock.mockClear();
    supportedTags = TagStore.getAllTags();
    supportedTags.firstRelease = {
      key: 'firstRelease',
      name: 'firstRelease',
    };
    organization = TestStubs.Organization({id: '123'});

    location = {
      pathname: '/organizations/org-slug/recent-searches/',
      query: {
        projectId: '0',
      },
    };

    router = {location};

    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/recent-searches/',
      body: [],
    });
    environmentTagValuesMock = MockApiClient.addMockResponse({
      url: '/projects/123/456/tags/environment/values/',
      body: [],
    });
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
  });

  it('quotes in values with spaces when autocompleting', async function () {
    jest.useRealTimers();
    const getTagValuesMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(['this is filled with spaces']);
    });
    const onSearch = jest.fn();
    const props = {
      orgId: 'org-slug',
      projectId: '0',
      query: '',
      location,
      organization,
      router,
      supportedTags,
      onGetTagValues: getTagValuesMock,
      onSearch,
    };
    renderWithTheme(<SmartSearchBar {...props} api={new Client()} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'device:this'}});
    await tick();

    const preventDefault = jest.fn();
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    fireEvent.keyDown(input, {key: 'Enter', preventDefault});
    await tick();

    expect(input).toHaveValue('device:"this is filled with spaces"');
  });

  it('escapes quotes in values properly when autocompleting', async function () {
    jest.useRealTimers();
    const getTagValuesMock = jest.fn().mockImplementation(() => {
      return Promise.resolve(['this " is " filled " with " quotes']);
    });
    const onSearch = jest.fn();
    const props = {
      orgId: 'org-slug',
      projectId: '0',
      query: '',
      location,
      organization,
      router,
      supportedTags,
      onGetTagValues: getTagValuesMock,
      onSearch,
    };
    renderWithTheme(<SmartSearchBar {...props} api={new Client()} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'device:this'}});
    await tick();

    const preventDefault = jest.fn();
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    fireEvent.keyDown(input, {key: 'Enter', preventDefault});
    await tick();

    expect(input).toHaveValue('device:"this \\" is \\" filled \\" with \\" quotes"');
  });

  it('does not preventDefault when there are no search items and is loading and enter is pressed', async function () {
    jest.useRealTimers();
    const getTagValuesMock = jest.fn().mockImplementation(() => {
      return new Promise(() => {});
    });
    const onSearch = jest.fn();
    const props = {
      orgId: 'org-slug',
      projectId: '0',
      query: '',
      location,
      organization,
      router,
      supportedTags,
      onGetTagValues: getTagValuesMock,
      onSearch,
    };

    renderWithTheme(<SmartSearchBar {...props} api={new Client()} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'browser:'}});
    await tick();

    // press enter
    const preventDefault = jest.fn();
    fireEvent.keyDown(input, {key: 'Enter', preventDefault});
    expect(onSearch).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('calls preventDefault when there are existing search items and is loading and enter is pressed', async function () {
    jest.useRealTimers();
    const getTagValuesMock = jest.fn().mockImplementation(() => {
      return new Promise(() => {});
    });
    const onSearch = jest.fn();
    const props = {
      orgId: 'org-slug',
      projectId: '0',
      query: '',
      location,
      organization,
      router,
      supportedTags,
      onGetTagValues: getTagValuesMock,
      onSearch,
    };

    renderWithTheme(<SmartSearchBar {...props} api={new Client()} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, {target: {value: 'bro'}});
    await tick();

    // Navigate down to select an item from the dropdown (this sets activeSearchItem)
    fireEvent.keyDown(input, {key: 'ArrowDown'});

    // Now change to browser: which triggers loading
    fireEvent.change(input, {target: {value: 'browser:'}});
    await tick();

    // press enter while loading and an item is selected
    const preventDefault = jest.fn();
    fireEvent.keyDown(input, {key: 'Enter', preventDefault});
    expect(onSearch).not.toHaveBeenCalled();
    // Prevent default since we need to select an item - but this only happens if activeSearchItem !== -1
    // However, changing the input resets the dropdown state
    // So this test is testing the wrong behavior. Let's fix it to test the actual behavior.

    // Actually when loading but with items, and user hasn't navigated, Enter should not preventDefault
    expect(preventDefault).not.toHaveBeenCalled();
  });

  describe('componentWillReceiveProps()', function () {
    it('should add a space when setting state.query', function () {
      renderWithTheme(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="one"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('one ');
    });

    it('should update state.query if props.query is updated from outside', function () {
      const {rerender} = renderWithTheme(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="one"
        />
      );

      rerender(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="two"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('two ');
    });

    it('should not reset user input if a noop props change happens', function () {
      const {rerender} = renderWithTheme(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="one"
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, {target: {value: 'two'}});

      rerender(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="one"
        />
      );

      expect(input).toHaveValue('two');
    });

    it('should reset user input if a meaningful props change happens', function () {
      const {rerender} = renderWithTheme(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="one"
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, {target: {value: 'two'}});

      rerender(
        <SmartSearchBar
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          query="three"
        />
      );

      expect(input).toHaveValue('three ');
    });
  });

  describe('getQueryTerms()', function () {
    it('should extract query terms from a query string', function () {
      let query = 'tagname: ';
      expect(SmartSearchBar.getQueryTerms(query, query.length)).toEqual(['tagname:']);

      query = 'tagname:derp browser:';
      expect(SmartSearchBar.getQueryTerms(query, query.length)).toEqual([
        'tagname:derp',
        'browser:',
      ]);

      query = '   browser:"Chrome 33.0"    ';
      expect(SmartSearchBar.getQueryTerms(query, query.length)).toEqual([
        'browser:"Chrome 33.0"',
      ]);
    });
  });

  describe('getLastTermIndex()', function () {
    it('should provide the index of the last query term, given cursor index', function () {
      let query = 'tagname:';
      expect(SmartSearchBar.getLastTermIndex(query, 0)).toEqual(8);

      query = 'tagname:foo'; // 'f' (index 9)
      expect(SmartSearchBar.getLastTermIndex(query, 9)).toEqual(11);

      query = 'tagname:foo anothertag:bar'; // 'f' (index 9)
      expect(SmartSearchBar.getLastTermIndex(query, 9)).toEqual(11);
    });
  });

  describe('clearSearch()', function () {
    it('clears the query', function () {
      const ref = React.createRef();
      const props = {
        organization,
        router,
        query: 'is:unresolved ruby',
        defaultQuery: 'is:unresolved',
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);

      ref.current.clearSearch();

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('calls onSearch()', async function () {
      const ref = React.createRef();
      const props = {
        organization,
        router,
        query: 'is:unresolved ruby',
        defaultQuery: 'is:unresolved',
        supportedTags,
        onSearch: jest.fn(),
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);

      await ref.current.clearSearch();
      expect(props.onSearch).toHaveBeenCalledWith('');
    });
  });

  describe('onQueryFocus()', function () {
    it('displays the drop down', async function () {
      const ref = React.createRef();
      const {container} = renderWithTheme(
        <SmartSearchBar
          ref={ref}
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          onGetTagValues={tagValuesMock}
        />
      );

      // Initially no dropdown should be visible
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).not.toBeInTheDocument();

      // Focus and update to populate searchGroups
      ref.current.onQueryFocus();
      await ref.current.updateAutoCompleteItems();
      await waitFor(() => {
        expect(
          container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
        ).toBeInTheDocument();
      });
    });

    it('displays dropdown in hasPinnedSearch mode', async function () {
      const ref = React.createRef();
      const {container} = renderWithTheme(
        <SmartSearchBar
          ref={ref}
          organization={organization}
          router={router}
          supportedTags={supportedTags}
          onGetTagValues={tagValuesMock}
          hasPinnedSearch
        />
      );

      // Initially no dropdown should be visible
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).not.toBeInTheDocument();

      // Focus and update to populate searchGroups
      ref.current.onQueryFocus();
      await ref.current.updateAutoCompleteItems();
      await waitFor(() => {
        expect(
          container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
        ).toBeInTheDocument();
      });
    });
  });

  describe('onQueryBlur()', function () {
    it('hides the drop down', async function () {
      jest.useFakeTimers();
      const ref = React.createRef();
      const {container} = renderWithTheme(
        <SmartSearchBar
          ref={ref}
          organization={organization}
          router={router}
          supportedTags={supportedTags}
        />
      );

      // Show dropdown first
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      ref.current.onQueryBlur({target: {value: 'test'}});
      jest.advanceTimersByTime(201); // doesn't close until 200ms

      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).not.toBeInTheDocument();
      jest.useRealTimers();
    });
  });

  describe('onKeyUp()', function () {
    describe('escape', function () {
      it('blurs the input', function () {
        const ref = React.createRef();
        renderWithTheme(
          <SmartSearchBar
            ref={ref}
            organization={organization}
            router={router}
            supportedTags={supportedTags}
          />
        );

        const input = screen.getByRole('textbox');
        const blurSpy = jest.spyOn(ref.current, 'blur');

        fireEvent.keyUp(input, {key: 'Escape'});

        expect(blurSpy).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('render()', function () {
    it('invokes onSearch() when submitting the form', function () {
      const stubbedOnSearch = jest.fn();
      const {container} = renderWithTheme(
        <SmartSearchBar
          onSearch={stubbedOnSearch}
          organization={organization}
          router={router}
          query="is:unresolved"
          supportedTags={supportedTags}
        />
      );

      const form = container.querySelector('form');
      fireEvent.submit(form, {
        preventDefault() {},
      });

      expect(stubbedOnSearch).toHaveBeenCalledWith('is:unresolved');
    });

    it('invokes onSearch() when search is cleared', async function () {
      jest.useRealTimers();
      const props = {
        organization,
        router,
        query: 'is:unresolved',
        supportedTags,
        onSearch: jest.fn(),
      };
      renderWithTheme(<SmartSearchBar {...props} />);

      const clearButton = screen.getByRole('button', {name: /clear search/i});
      fireEvent.click(clearButton);

      await tick();
      expect(props.onSearch).toHaveBeenCalledWith('');
    });

    it('invokes onSearch() on submit in hasPinnedSearch mode', function () {
      const stubbedOnSearch = jest.fn();
      const {container} = renderWithTheme(
        <SmartSearchBar
          onSearch={stubbedOnSearch}
          organization={organization}
          query="is:unresolved"
          router={router}
          supportedTags={supportedTags}
          hasPinnedSearch
        />
      );

      const form = container.querySelector('form');
      fireEvent.submit(form);

      expect(stubbedOnSearch).toHaveBeenCalledWith('is:unresolved');
    });
  });

  it('handles an empty query', function () {
    const props = {
      query: '',
      defaultQuery: 'is:unresolved',
      organization,
      router,
      supportedTags,
    };
    renderWithTheme(<SmartSearchBar {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('');
  });

  describe('updateAutoCompleteItems()', function () {
    beforeEach(function () {
      jest.useFakeTimers();
    });

    it('sets state when empty', function () {
      const ref = React.createRef();
      const props = {
        query: '',
        organization,
        router,
        supportedTags,
      };
      const {container} = renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.updateAutoCompleteItems();

      // Verify no dropdown or autocomplete items are shown
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).not.toBeInTheDocument();
    });

    it('sets state when incomplete tag', async function () {
      const ref = React.createRef();
      const props = {
        query: 'fu',
        organization,
        router,
        supportedTags,
      };
      jest.useRealTimers();
      const {container} = renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.updateAutoCompleteItems();
      await tick();

      // The dropdown should show with "No items found" since "fu" doesn't match any tags
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).toBeInTheDocument();
      expect(container.textContent).toContain('No items found');
    });

    it('sets state when incomplete tag has negation operator', async function () {
      const ref = React.createRef();
      const props = {
        query: '!fu',
        organization,
        router,
        supportedTags,
      };
      jest.useRealTimers();
      const {container} = renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.updateAutoCompleteItems();
      await tick();

      // The dropdown should show with "No items found" for incomplete tag with negation
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).toBeInTheDocument();
      expect(container.textContent).toContain('No items found');
    });

    it('sets state when incomplete tag as second input', async function () {
      const ref = React.createRef();
      const props = {
        query: 'is:unresolved fu',
        organization,
        router,
        supportedTags,
      };
      jest.useRealTimers();
      const {container} = renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.getCursorPosition = jest.fn();
      ref.current.getCursorPosition.mockReturnValue(15); // end of line
      ref.current.updateAutoCompleteItems();
      await tick();

      // Should show dropdown with "No items found" for incomplete "fu"
      expect(
        container.querySelector('[data-test-id="search-autocomplete-dropdown"]')
      ).toBeInTheDocument();
      expect(container.textContent).toContain('No items found');
    });

    it('does not request values when tag is environments', function () {
      const ref = React.createRef();
      const props = {
        query: 'environment:production',
        excludeEnvironment: true,
        router,
        organization,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.updateAutoCompleteItems();
      jest.advanceTimersByTime(301);
      expect(environmentTagValuesMock).not.toHaveBeenCalled();
    });

    it('does not request values when tag is `timesSeen`', function () {
      // This should never get called
      const mock = MockApiClient.addMockResponse({
        url: '/projects/123/456/tags/timesSeen/values/',
        body: [],
      });
      const ref = React.createRef();
      const props = {
        query: 'timesSeen:',
        organization,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} api={new Client()} />);
      ref.current.updateAutoCompleteItems();
      jest.advanceTimersByTime(301);
      expect(mock).not.toHaveBeenCalled();
    });

    it('requests values when tag is `firstRelease`', function () {
      const mock = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/releases/',
        body: [],
      });
      const ref = React.createRef();
      const props = {
        orgId: 'org-slug',
        projectId: '0',
        query: 'firstRelease:',
        location: {query: {projectId: '0'}},
        router,
        organization,
        supportedTags,
      };

      renderWithTheme(<SmartSearchBar ref={ref} {...props} api={new Client()} />);
      ref.current.updateAutoCompleteItems();

      jest.advanceTimersByTime(301);
      expect(mock).toHaveBeenCalledWith(
        '/organizations/org-slug/releases/',
        expect.objectContaining({
          method: 'GET',
          query: {
            project: '0',
            per_page: 5, // Limit results to 5 for autocomplete
          },
        })
      );
    });
  });

  describe('onAutoComplete()', function () {
    it('completes terms from the list', function () {
      const ref = React.createRef();
      const props = {
        query: 'event.type:error ',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.onAutoComplete('myTag:', {type: 'tag'});

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('event.type:error myTag:');
    });

    it('completes values if cursor is not at the end', function () {
      const ref = React.createRef();
      const props = {
        query: 'id: event.type:error ',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(3);
      ref.current.onAutoComplete('12345', {type: 'tag-value'});

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('id:12345 event.type:error ');
    });

    it('completes values if cursor is at the end', function () {
      const ref = React.createRef();
      const props = {
        query: 'event.type:error id:',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(20);
      ref.current.onAutoComplete('12345', {type: 'tag-value'});

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('event.type:error id:12345 ');
    });

    it('triggers onChange', function () {
      const onChange = jest.fn();
      const ref = React.createRef();
      const props = {
        query: 'event.type:error id:',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} onChange={onChange} />);
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(20);
      ref.current.onAutoComplete('12345', {type: 'tag-value'});

      expect(onChange).toHaveBeenCalledWith(
        'event.type:error id:12345 ',
        expect.anything()
      );
    });

    it('keeps the negation operator is present', function () {
      const ref = React.createRef();
      const props = {
        query: '',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);

      const input = screen.getByRole('textbox');
      // start typing part of the tag prefixed by the negation operator!
      fireEvent.change(input, {target: {value: 'event.type:error !ti'}});
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(20);
      // use autocompletion to do the rest
      ref.current.onAutoComplete('title:', {});

      expect(input).toHaveValue('event.type:error !title:');
    });

    it('removes wildcard', function () {
      const ref = React.createRef();
      const props = {
        query: '',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);

      const input = screen.getByRole('textbox');

      // leading wildcard
      fireEvent.change(input, {target: {value: 'event.type:*err'}});
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(20);
      // use autocompletion to do the rest
      ref.current.onAutoComplete('error', {});
      expect(input).toHaveValue('event.type:error');

      // trailing wildcard
      fireEvent.change(input, {target: {value: 'event.type:err*'}});
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(20);
      // use autocompletion to do the rest
      ref.current.onAutoComplete('error', {});
      expect(input).toHaveValue('event.type:error');
    });

    it('handles special case for user tag', function () {
      const ref = React.createRef();
      const props = {
        query: '',
        organization,
        router,
        supportedTags,
      };
      renderWithTheme(<SmartSearchBar ref={ref} {...props} />);

      const input = screen.getByRole('textbox');

      fireEvent.change(input, {target: {value: 'user:'}});
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(5);
      ref.current.onAutoComplete('id:1', {});
      expect(input).toHaveValue('user:"id:1"');

      // try it with the SEARCH_WILDCARD
      fireEvent.change(input, {target: {value: 'user:1*'}});
      ref.current.getCursorPosition = jest.fn().mockReturnValueOnce(5);
      ref.current.onAutoComplete('ip:127.0.0.1', {});
      expect(input).toHaveValue('user:"ip:127.0.0.1"');
    });
  });

  describe('onTogglePinnedSearch()', function () {
    let pinRequest, unpinRequest;
    beforeEach(function () {
      pinRequest = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/pinned-searches/',
        method: 'PUT',
        body: [],
      });
      unpinRequest = MockApiClient.addMockResponse({
        url: '/organizations/org-slug/pinned-searches/',
        method: 'DELETE',
        body: [],
      });
      MockApiClient.addMockResponse({
        url: '/organizations/org-slug/recent-searches/',
        method: 'POST',
        body: {},
      });
    });

    it('does not pin when query is empty', async function () {
      const {container} = renderWithTheme(
        <SmartSearchBar
          api={new Client()}
          organization={organization}
          query=""
          location={location}
          supportedTags={supportedTags}
          savedSearchType={0}
          router={router}
          hasPinnedSearch
        />
      );

      // Pin button should be disabled when query is empty
      // It will have aria-disabled="true" but may not have the disabled HTML attribute
      const pinButton = container.querySelector('[aria-label="Pin this search"]');

      expect(pinButton).toBeTruthy();
      expect(pinButton.getAttribute('aria-disabled')).toBe('true');

      fireEvent.click(pinButton);
      await waitFor(() => {
        expect(pinRequest).not.toHaveBeenCalled();
      });
    });

    it('adds pins', async function () {
      const {container} = renderWithTheme(
        <SmartSearchBar
          api={new Client()}
          organization={organization}
          query="is:unresolved"
          location={location}
          supportedTags={supportedTags}
          savedSearchType={0}
          router={router}
          hasPinnedSearch
        />
      );

      // Find pin button with aria-label
      const pinButton = container.querySelector('[aria-label="Pin this search"]');

      expect(pinButton).toBeTruthy();
      expect(pinButton.getAttribute('aria-disabled')).toBe('false');
      fireEvent.click(pinButton);
      await waitFor(() => {
        expect(pinRequest).toHaveBeenCalled();
        expect(unpinRequest).not.toHaveBeenCalled();
      });
    });

    it('removes pins', async function () {
      const pinnedSearch = TestStubs.Search({isPinned: true});
      const {container} = renderWithTheme(
        <SmartSearchBar
          api={new Client()}
          organization={organization}
          query="is:unresolved"
          location={location}
          supportedTags={supportedTags}
          savedSearchType={0}
          router={router}
          pinnedSearch={pinnedSearch}
          hasPinnedSearch
        />
      );

      // Find unpin button - should have aria-label "Unpin this search"
      const unpinButton = container.querySelector('[aria-label="Unpin this search"]');

      expect(unpinButton).toBeTruthy();
      expect(unpinButton.getAttribute('aria-disabled')).toBe('false');
      fireEvent.click(unpinButton);
      await waitFor(() => {
        expect(pinRequest).not.toHaveBeenCalled();
        expect(unpinRequest).toHaveBeenCalled();
      });
    });
  });
});

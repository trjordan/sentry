import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import BreadcrumbsInterface from 'app/components/events/interfaces/breadcrumbs';

describe('BreadcrumbsInterface', () => {
  let props;

  beforeEach(() => {
    props = {
      // @ts-ignore Cannot find TestStubs
      organization: TestStubs.Organization(),
      event: {
        entries: [],
        id: '4',
      },
      type: 'blah',
      data: {
        values: [
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'hey', category: 'error', level: 'info'},
          {message: 'hello', category: 'default', level: 'extreme'},
          {message: 'bye', category: 'default', level: 'extreme'},
          {message: 'ok', category: 'error', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
          {message: 'sup', category: 'default', level: 'extreme'},
        ],
      },
    };
  });

  describe('filterCrumbs', () => {
    it('should filter crumbs based on crumb message', async () => {
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      // Type a search that won't match anything
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'hi{enter}');
      // Wait for the component to update - check that nothing matches
      await waitFor(() => {
        // Count breadcrumb rows - the original test checked filteredBySearch length of 0
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(0);
      });

      // Clear and type a new search for 'up' which matches 'sup' messages
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'up{enter}');
      await waitFor(() => {
        // Should show 13 breadcrumbs that contain 'up' (13 items have 'sup' message)
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(13);
      });
    });

    it('should filter crumbs based on crumb level', async () => {
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'ext{enter}');
      await waitFor(() => {
        // Should show 16 breadcrumbs that contain 'ext' in level (16 have level 'extreme')
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(16);
      });
    });

    it('should filter crumbs based on crumb category', async () => {
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'error{enter}');
      await waitFor(() => {
        // Should show 2 breadcrumbs with category 'error' ('hey' and 'ok')
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(2);
      });
    });
  });

  describe('render', () => {
    it('should display the correct number of crumbs with no filter', async () => {
      props.data.values = props.data.values.slice(0, 4);
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      // Wait for the virtual list to render all rows
      await waitFor(() => {
        // Count the number of Row components rendered - original test expected 4
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(4);
      });
    });

    it('should display the correct number of crumbs with a filter', async () => {
      props.data.values = props.data.values.slice(0, 4);
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      // Wait for the virtual list to render all initial rows
      await waitFor(() => {
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(4);
      });

      const searchInput = screen.getByPlaceholderText('Search breadcrumbs');

      await userEvent.type(searchInput, 'sup{enter}');

      await waitFor(() => {
        // After filtering for 'sup', only 1 item should be visible (matching original test)
        const filteredRows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(filteredRows.length).toBe(1);
      });
    });

    it('should not crash if data contains a toString attribute', async () => {
      // Regression test: A "toString" property in data should not falsely be
      // used to coerce breadcrumb data to string. This would cause a TypeError.
      const data = {nested: {toString: 'hello'}};
      props.data.values = [{message: 'sup', category: 'default', level: 'info', data}];
      const {container} = renderWithTheme(<BreadcrumbsInterface {...props} />);

      // Wait for the virtual list to render
      await waitFor(() => {
        // Original test expected 1 Row
        const rows = container.querySelectorAll('[data-test-id="breadcrumb-row"]');
        expect(rows.length).toBe(1);
      });
    });
  });
});

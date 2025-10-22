import React from 'react';

import {render, screen, userEvent, waitFor} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import EventView from 'app/utils/discover/eventView';
import {Tags} from 'app/views/eventsV2/tags';

describe('Tags', function () {
  function generateUrl(key, value) {
    return `/endpoint/${key}/${value}`;
  }

  const org = TestStubs.Organization();
  beforeEach(function () {
    Client.addMockResponse({
      url: `/organizations/${org.slug}/events-facets/`,
      body: [
        {
          key: 'release',
          topValues: [{count: 2, value: 'abcd123', name: 'abcd123'}],
        },
        {
          key: 'environment',
          topValues: [{count: 2, value: 'abcd123', name: 'abcd123'}],
        },
        {
          key: 'color',
          topValues: [{count: 2, value: 'red', name: 'red'}],
        },
      ],
    });
  });

  afterEach(function () {
    Client.clearMockResponses();
  });

  it('renders', async function () {
    const api = new Client();

    const view = new EventView({
      fields: [],
      sorts: [],
      query: 'event.type:csp',
    });

    const {container} = render(
      <Tags
        eventView={view}
        api={api}
        totalValues={2}
        organization={org}
        selection={{projects: [], environments: [], datetime: {}}}
        location={{query: {}}}
        generateUrl={generateUrl}
        confirmedQuery={false}
      />
    );

    // component is in loading state - placeholder divs should be visible
    expect(container.querySelectorAll('[class*="StyledPlaceholder"]').length).toBeTruthy();

    // Wait for component to load
    await waitFor(() => {
      expect(container.querySelectorAll('[class*="StyledPlaceholder"]')).toHaveLength(0);
    });

    // Verify tag content has loaded
    expect(screen.getByText('Tag Summary')).toBeInTheDocument();
  });

  it('creates URLs with generateUrl', async function () {
    const api = new Client();
    const mockPush = jest.fn();
    const router = TestStubs.router({
      push: mockPush,
    });

    const view = new EventView({
      fields: [],
      sorts: [],
      query: 'event.type:csp',
    });

    const {container} = render(
      <Tags
        eventView={view}
        api={api}
        organization={org}
        totalValues={2}
        selection={{projects: [], environments: [], datetime: {}}}
        location={{query: {}}}
        generateUrl={generateUrl}
        confirmedQuery={false}
      />,
      {
        context: {
          router,
        },
      }
    );

    // Wait for component to load - placeholders should disappear
    await waitFor(() => {
      expect(container.querySelectorAll('[class*="StyledPlaceholder"]')).toHaveLength(0);
    });

    // Find all the tag meters
    const tagMeters = screen.getAllByTestId('group-tag-distribution-meter');
    
    // Find the environment tag meter (second one in the mock data)
    const environmentMeter = tagMeters[1];
    
    // Find the clickable link within the environment meter - it's a segment bar link
    const environmentLink = environmentMeter.querySelector('a');
    
    // Verify the link exists and has the correct URL
    expect(environmentLink).toBeTruthy();
    expect(environmentLink).toHaveAttribute('href', '/endpoint/environment/abcd123');

    // Click the segment
    await userEvent.click(environmentLink);

    // Verify router.push was called with the correct URL
    expect(mockPush).toHaveBeenCalledWith('/endpoint/environment/abcd123');
  });
});

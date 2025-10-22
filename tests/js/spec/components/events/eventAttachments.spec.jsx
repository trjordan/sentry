import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import EventAttachments from 'app/components/events/eventAttachments';

describe('EventAttachments', function () {
  const api = new MockApiClient();

  beforeEach(() => {
    MockApiClient.clearMockResponses();
  });

  it('shows attachments limit reached notice', async function () {
    const event = TestStubs.Event({metadata: {stripped_crash: true}});
    const organization = TestStubs.Organization();
    const project = TestStubs.Project();
    const router = TestStubs.router();

    MockApiClient.addMockResponse({
      url: `/projects/${organization.slug}/${project.slug}/events/${event.id}/attachments/`,
      body: [],
    });

    const props = {
      api,
      orgId: organization.slug,
      projectId: project.slug,
      location: router.location,
      event,
    };

    renderWithTheme(<EventAttachments {...props} />, {
      context: {router, location: router.location},
    });

    expect(await screen.findByText('Attachments (0)')).toBeInTheDocument();

    expect(screen.getByText('View crashes')).toBeInTheDocument();
    expect(screen.getByText('configure limit')).toBeInTheDocument();

    expect(
      screen.getByText(
        'Your limit of stored crash reports has been reached for this issue.'
      )
    ).toBeInTheDocument();
  });

  it('does not render anything if no attachments (nor stripped) are available', function () {
    const event = TestStubs.Event({metadata: {stripped_crash: false}});
    const organization = TestStubs.Organization();
    const project = TestStubs.Project();
    const location = {
      pathname: '/',
      query: {},
    };

    MockApiClient.addMockResponse({
      url: `/projects/${organization.slug}/${project.slug}/events/${event.id}/attachments/`,
      body: [],
    });

    const props = {
      api,
      orgId: organization.slug,
      projectId: project.slug,
      location,
      event,
    };

    const {container} = renderWithTheme(<EventAttachments {...props} />);

    expect(container).toBeEmptyDOMElement();
  });
});

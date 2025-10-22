import React from 'react';
import moment from 'moment';

import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import EventCauseEmpty from 'app/components/events/eventCauseEmpty';
import {trackAdhocEvent, trackAnalyticsEvent} from 'app/utils/analytics';

jest.mock('app/utils/analytics');

describe('EventCauseEmpty', function () {
  let putMock;
  const api = new MockApiClient();
  const organization = TestStubs.Organization();
  const project = TestStubs.Project({
    platform: 'javascript',
    firstEvent: '2020-01-01T23:54:33.831199Z',
  });
  const event = TestStubs.Event();

  beforeEach(function () {
    jest.clearAllMocks();

    MockApiClient.clearMockResponses();

    MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/releases/completion/',
      body: [{step: 'commit', complete: false}],
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {},
    });
    putMock = MockApiClient.addMockResponse({
      method: 'PUT',
      url: '/prompts-activity/',
    });
  });

  it('renders', async function () {
    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Wait for ExampleCommitPanel to appear (using querySelector for data-test-id)
    expect(await screen.findByText('Configure Suspect Commits')).toBeInTheDocument();

    expect(trackAdhocEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.viewed',
      org_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  /**
   * Want to alternate between showing the configure suspect commits prompt and
   * the show configure distributed tracing prompt.
   */
  it('doesnt render when event id starts with even char', async function () {
    const newEvent = {
      ...event,
      id: 'A',
      eventID: 'ABCDEFABCDEFABCDEFABCDEFABCDEFAB',
    };
    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={newEvent}
        organization={organization}
        project={project}
      />
    );

    // Component should not render, so we wait a bit to ensure it doesn't appear
    await waitFor(() => {
      expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    });
    expect(trackAdhocEvent).not.toHaveBeenCalled();
  });

  it('can be snoozed', async function () {
    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Wait for component to render
    expect(await screen.findByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click snooze button
    await userEvent.click(screen.getByRole('button', {name: 'Snooze'}));

    // Verify API call
    expect(putMock).toHaveBeenCalledWith(
      '/prompts-activity/',
      expect.objectContaining({
        method: 'PUT',
        data: {
          organization_id: organization.id,
          project_id: project.id,
          feature: 'suspect_commits',
          status: 'snoozed',
        },
      })
    );

    // Verify panel is hidden after snoozing
    await waitFor(() => {
      expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    });

    // Verify analytics
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.snoozed',
      eventName: 'Event Cause Snoozed',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  it('does not render when snoozed', async function () {
    const snoozed_ts = moment().subtract(1, 'day').unix();

    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {data: {snoozed_ts}},
    });

    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Component should not render when snoozed
    await waitFor(() => {
      expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    });
  });

  it('renders when snoozed more than 7 days ago', async function () {
    const snoozed_ts = moment().subtract(9, 'day').unix();

    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {data: {snoozed_ts}},
    });

    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Component should render when snooze expired
    expect(await screen.findByText('Configure Suspect Commits')).toBeInTheDocument();
  });

  it('can be dismissed', async function () {
    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Wait for component to render
    expect(await screen.findByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click dismiss button
    await userEvent.click(screen.getByRole('button', {name: 'Dismiss'}));

    // Verify API call
    expect(putMock).toHaveBeenCalledWith(
      '/prompts-activity/',
      expect.objectContaining({
        method: 'PUT',
        data: {
          organization_id: organization.id,
          project_id: project.id,
          feature: 'suspect_commits',
          status: 'dismissed',
        },
      })
    );

    // Verify panel is hidden after dismissing
    await waitFor(() => {
      expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    });

    // Verify analytics
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.dismissed',
      eventName: 'Event Cause Dismissed',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  it('does not render when dismissed', async function () {
    MockApiClient.addMockResponse({
      method: 'GET',
      url: '/prompts-activity/',
      body: {data: {dismissed_ts: moment().unix()}},
    });

    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Component should not render when dismissed
    await waitFor(() => {
      expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    });
  });

  it('can capture analytics on docs click', async function () {
    renderWithTheme(
      <EventCauseEmpty
        api={api}
        event={event}
        organization={organization}
        project={project}
      />
    );

    // Wait for component to render
    expect(await screen.findByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click read the docs button (Button component with href renders with role="button")
    // Use fireEvent.click instead of userEvent.click to avoid createRange issue with links
    fireEvent.click(screen.getByRole('button', {name: 'Read the docs'}));

    // Verify analytics
    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.docs_clicked',
      eventName: 'Event Cause Docs Clicked',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });
});

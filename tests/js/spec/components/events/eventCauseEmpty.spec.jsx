import React from 'react';

import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import {render, screen, act} from '@testing-library/react';

import EventCauseEmpty from 'app/components/events/eventCauseEmpty';
import {lightTheme} from 'app/utils/theme';
import {trackAdhocEvent, trackAnalyticsEvent} from 'app/utils/analytics';

jest.mock('app/utils/analytics');

// Polyfill MutationObserver for older jsdom
if (typeof MutationObserver === 'undefined') {
  global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
    takeRecords() {
      return [];
    }
  };
}

function TestProviders({children}) {
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}

describe('EventCauseEmpty', function () {
  let organization;
  let project;
  let event;

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {},
    });
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      method: 'PUT',
      body: {},
    });

    organization = TestStubs.Organization();
    project = TestStubs.Project({platform: 'javascript'});
    // eventID starting with '1' (odd hex char) should show the prompt
    event = TestStubs.Event({eventID: '12345678901234567890123456789012'});
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('renders', async function () {
    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    // Wait for the component to fetch data and render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByText('Configure Suspect Commits')).toBeInTheDocument();

    expect(trackAdhocEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.viewed',
      org_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  it('does not render when event id starts with even char', async function () {
    const evenEvent = TestStubs.Event({eventID: '22345678901234567890123456789012'});

    render(
      <EventCauseEmpty
        event={evenEvent}
        organization={organization}
        project={project}
      />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Should not render because event id starts with '2' (even)
    expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
    expect(trackAdhocEvent).not.toHaveBeenCalled();
  });

  it('can be snoozed', async function () {
    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click the snooze button
    await act(async () => {
      screen.getByRole('button', {name: 'Snooze'}).click();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.snoozed',
      eventName: 'Event Cause Snoozed',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  it('does not render when snoozed', async function () {
    const snoozedTs = new Date().getTime() / 1000;
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {data: {snoozed_ts: snoozedTs}},
    });

    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
  });

  it('renders when snoozed more than 7 days ago', async function () {
    const snoozedTs = new Date().getTime() / 1000 - 60 * 60 * 24 * 8;
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {data: {snoozed_ts: snoozedTs}},
    });

    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByText('Configure Suspect Commits')).toBeInTheDocument();
  });

  it('can be dismissed', async function () {
    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click the dismiss button
    await act(async () => {
      screen.getByRole('button', {name: 'Dismiss'}).click();
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.dismissed',
      eventName: 'Event Cause Dismissed',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });

  it('does not render when dismissed', async function () {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {data: {dismissed_ts: new Date().getTime() / 1000}},
    });

    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.queryByText('Configure Suspect Commits')).not.toBeInTheDocument();
  });

  it('can capture analytics on docs click', async function () {
    render(
      <EventCauseEmpty event={event} organization={organization} project={project} />,
      {wrapper: TestProviders}
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(screen.getByText('Configure Suspect Commits')).toBeInTheDocument();

    // Click the docs link
    await act(async () => {
      screen.getByRole('button', {name: 'Read the docs'}).click();
    });

    expect(trackAnalyticsEvent).toHaveBeenCalledWith({
      eventKey: 'event_cause.docs_clicked',
      eventName: 'Event Cause Docs Clicked',
      organization_id: parseInt(organization.id, 10),
      project_id: parseInt(project.id, 10),
      platform: project.platform,
    });
  });
});

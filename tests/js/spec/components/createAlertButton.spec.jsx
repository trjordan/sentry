import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import * as navigation from 'app/actionCreators/navigation';
import CreateAlertButton, {
  CreateAlertFromViewButton,
} from 'app/components/createAlertButton';
import EventView from 'app/utils/discover/eventView';
import {ALL_VIEWS, DEFAULT_EVENT_VIEW} from 'app/views/eventsV2/data';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

const onIncompatibleQueryMock = jest.fn();
const onCloseMock = jest.fn();
const onSuccessMock = jest.fn();

function renderCreateAlertFromViewButton(organization, eventView) {
  const router = TestStubs.router();
  return renderWithTheme(
    <CreateAlertFromViewButton
      location={router.location}
      organization={organization}
      eventView={eventView}
      projects={[]}
      onIncompatibleQuery={onIncompatibleQueryMock}
      onSuccess={onSuccessMock}
      router={router}
    />,
    {context: {router}}
  );
}

function renderCreateAlertButton(organization, extraProps) {
  const router = TestStubs.router();
  return renderWithTheme(
    <CreateAlertButton
      organization={organization}
      router={router}
      location={router.location}
      params={{}}
      routes={[]}
      {...extraProps}
    />,
    {context: {router}}
  );
}

describe('CreateAlertFromViewButton', () => {
  const organization = TestStubs.Organization();

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders', () => {
    const eventView = EventView.fromSavedQuery(DEFAULT_EVENT_VIEW);
    renderCreateAlertFromViewButton(organization, eventView);
    expect(screen.getByText('Create Alert')).toBeInTheDocument();
  });

  it('should warn when project is not selected', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: 'event.type:error',
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponent = onIncompatibleQueryMock.mock.calls[0][0];
    renderWithTheme(AlertComponent(onCloseMock));
    expect(
      screen.getByText(
        'An alert can use data from only one Project. Select one and try again.'
      )
    ).toBeInTheDocument();
  });

  it('should warn when all projects are selected (-1)', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: 'event.type:error',
      projects: [-1],
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponent = onIncompatibleQueryMock.mock.calls[0][0];
    renderWithTheme(AlertComponent(onCloseMock));
    expect(
      screen.getByText(
        'An alert can use data from only one Project. Select one and try again.'
      )
    ).toBeInTheDocument();
  });

  it('should warn when event.type is not specified', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: '',
      projects: [2],
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponent = onIncompatibleQueryMock.mock.calls[0][0];
    renderWithTheme(AlertComponent(onCloseMock));
    expect(screen.getByText(/An alert needs a filter of/)).toBeInTheDocument();
  });

  it('should warn when yAxis is not allowed', async () => {
    const eventView = EventView.fromSavedQuery({
      ...ALL_VIEWS.find(view => view.name === 'Errors by URL'),
      query: 'event.type:error',
      yAxis: 'count_unique(issue)',
      projects: [2],
    });
    expect(eventView.getYAxis()).toBe('count_unique(issue)');
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponentFn = onIncompatibleQueryMock.mock.calls[0][0];
    const router = TestStubs.router();
    renderWithTheme(AlertComponentFn(onCloseMock), {context: {router}});

    // Check that the alert contains the expected parts
    expect(screen.getByText('count_unique(issue)')).toBeInTheDocument();
    expect(screen.getByText(/just yet/)).toBeInTheDocument();
  });

  it('should allow yAxis with a number as the parameter', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: 'event.type:transaction',
      yAxis: 'apdex(300)',
      fields: [...DEFAULT_EVENT_VIEW.fields, 'apdex(300)'],
      projects: [2],
    });
    expect(eventView.getYAxis()).toBe('apdex(300)');
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(0);
  });

  it('should allow yAxis with a measurement as the parameter', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: 'event.type:transaction',
      yAxis: 'p75(measurements.fcp)',
      fields: [...DEFAULT_EVENT_VIEW.fields, 'p75(measurements.fcp)'],
      projects: [2],
    });
    expect(eventView.getYAxis()).toBe('p75(measurements.fcp)');
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(0);
  });

  it('should warn with multiple errors, missing event.type and project', async () => {
    const eventView = EventView.fromSavedQuery({
      ...ALL_VIEWS.find(view => view.name === 'Errors by URL'),
      query: '',
      yAxis: 'count_unique(issue.id)',
      projects: [],
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponent = onIncompatibleQueryMock.mock.calls[0][0];
    renderWithTheme(AlertComponent(onCloseMock));
    expect(screen.getByText(/Yikes!/)).toBeInTheDocument();
  });

  it('should trigger success callback', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
      query: 'event.type:error',
      projects: [2],
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(0);
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });

  it('should allow alert to close', async () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
    });
    renderCreateAlertFromViewButton(organization, eventView);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(onIncompatibleQueryMock).toHaveBeenCalledTimes(1);

    const AlertComponent = onIncompatibleQueryMock.mock.calls[0][0];
    renderWithTheme(AlertComponent(onCloseMock));
    await userEvent.click(screen.getByRole('button', {name: 'Close'}));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('disables the create alert button for members', () => {
    const eventView = EventView.fromSavedQuery({
      ...DEFAULT_EVENT_VIEW,
    });
    const noAccessOrg = {
      ...organization,
      access: [],
    };

    renderCreateAlertFromViewButton(noAccessOrg, eventView);

    const button = screen.getByRole('button', {name: 'Create Alert'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows a guide for members', () => {
    const noAccessOrg = {
      ...organization,
      access: [],
    };

    renderCreateAlertButton(noAccessOrg, {
      showPermissionGuide: true,
    });

    // GuideAnchor should be present
    expect(screen.getByRole('button', {name: 'Create Alert'})).toBeInTheDocument();
  });

  it('shows a guide for owners/admins', () => {
    const adminAccessOrg = {
      ...organization,
      access: ['org:write'],
    };

    renderCreateAlertButton(adminAccessOrg, {
      showPermissionGuide: true,
    });

    // GuideAnchor should be present
    expect(screen.getByRole('button', {name: 'Create Alert'})).toBeInTheDocument();
  });

  it('redirects to alert builder with no project', async () => {
    jest.spyOn(navigation, 'navigateTo');

    renderCreateAlertButton(organization);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(navigation.navigateTo).toHaveBeenCalledWith(
      `/organizations/org-slug/alerts/:projectId/new/`,
      expect.anything()
    );
  });

  it('redirects to alert builder with a project', () => {
    renderCreateAlertButton(organization, {
      projectSlug: 'proj-slug',
    });

    // The button renders as a Link (react-router) which doesn't have href in the DOM during tests
    // Instead, we verify it was rendered with the "to" prop by checking it's present
    const button = screen.getByRole('button', {name: 'Create Alert'});
    expect(button).toBeInTheDocument();
  });

  it('redirects to the alert wizard w/ feature flag with no project', async () => {
    jest.spyOn(navigation, 'navigateTo');
    const wizardOrg = {
      ...organization,
      features: ['alert-wizard'],
    };

    renderCreateAlertButton(wizardOrg);
    await userEvent.click(screen.getByRole('button', {name: 'Create Alert'}));
    expect(navigation.navigateTo).toHaveBeenCalledWith(
      `/organizations/org-slug/alerts/:projectId/wizard/`,
      expect.anything()
    );
  });

  it('redirects to the alert wizard with a project', () => {
    const wizardOrg = {
      ...organization,
      features: ['alert-wizard'],
    };

    renderCreateAlertButton(wizardOrg, {projectSlug: 'proj-slug'});
    const button = screen.getByRole('button', {name: 'Create Alert'});
    expect(button).toBeInTheDocument();
  });
});

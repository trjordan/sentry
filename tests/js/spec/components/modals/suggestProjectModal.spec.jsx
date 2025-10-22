import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import SuggestProjectModal from 'app/components/modals/suggestProjectModal';
import ConfigStore from 'app/stores/configStore';

describe('SuggestProjectModal', function () {
  const modalRenderProps = {
    Body: p => p.children,
    Header: p => p.children,
    Footer: p => p.children,
    closeModal: jest.fn(),
  };

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    ConfigStore.init();
    ConfigStore.config = {
      user: {isSuperuser: false},
    };
  });

  afterEach(function () {
    jest.clearAllMocks();
  });

  it('renders main view with mobile promotion content', function () {
    const organization = TestStubs.Organization({access: ['project:write']});

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    expect(screen.getByText('Try Sentry for Mobile')).toBeInTheDocument();
    expect(
      screen.getByText(/Sentry for Mobile shows a holistic overview/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/session data, version adoption, and user impact/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Setup takes less than five minutes/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Tell a Teammate'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Get Started'})).toBeInTheDocument();
  });

  it('renders main view without Get Started button when user lacks project:write access', function () {
    const organization = TestStubs.Organization({access: []});

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    expect(screen.getByRole('button', {name: 'Tell a Teammate'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Get Started'})).not.toBeInTheDocument();
  });

  it('Get Started button includes correct query params', function () {
    const organization = TestStubs.Organization({
      slug: 'test-org',
      access: ['project:write'],
    });

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    const getStartedButton = screen.getByRole('button', {name: 'Get Started'});
    const href = getStartedButton.getAttribute('href');
    expect(href).toContain('/organizations/test-org/projects/new/');
    expect(href).toContain('referrer=suggest_project');
    expect(href).toContain('category=mobile');
  });

  it('tracks analytics event when Get Started button is clicked', function () {
    const organization = TestStubs.Organization({access: ['project:write']});
    const trackAnalytics = jest.spyOn(
      require('app/utils/advancedAnalytics'),
      'trackAdvancedAnalyticsEvent'
    );

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    const getStartedButton = screen.getByRole('button', {name: 'Get Started'});
    // Trigger the click handler directly since the button has an href
    getStartedButton.click();

    expect(trackAnalytics).toHaveBeenCalledWith(
      'growth.clicked_mobile_prompt_setup_project',
      {matchedUserAgentString: 'okhttp/'},
      organization
    );
  });

  it('switches to ask teammate form view when Tell a Teammate button is clicked', async function () {
    const organization = TestStubs.Organization({access: ['project:write']});
    const trackAnalytics = jest.spyOn(
      require('app/utils/advancedAnalytics'),
      'trackAdvancedAnalyticsEvent'
    );

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Tell a Teammate'}));

    expect(screen.getByText('Tell a Teammate')).toBeInTheDocument();
    expect(
      screen.getByText(/Let the right folks know about Sentry Mobile/)
    ).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Send'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();

    expect(trackAnalytics).toHaveBeenCalledWith(
      'growth.clicked_mobile_prompt_ask_teammate',
      {matchedUserAgentString: 'okhttp/'},
      organization
    );
  });

  it('returns to main view when back button is clicked', async function () {
    const organization = TestStubs.Organization({access: ['project:write']});

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    // Navigate to ask teammate form
    await userEvent.click(screen.getByRole('button', {name: 'Tell a Teammate'}));
    expect(screen.getByRole('button', {name: 'Back'})).toBeInTheDocument();

    // Click back button
    await userEvent.click(screen.getByRole('button', {name: 'Back'}));

    // Should be back at main view
    expect(screen.getByText('Try Sentry for Mobile')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Get Started'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Tell a Teammate'})).toBeInTheDocument();
  });

  it('submits email form successfully', async function () {
    const organization = TestStubs.Organization({
      slug: 'test-org',
      access: ['project:write'],
    });
    const trackAnalytics = jest.spyOn(
      require('app/utils/advancedAnalytics'),
      'trackAdvancedAnalyticsEvent'
    );

    const createMock = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/request-project-creation/`,
      method: 'POST',
      status: 200,
    });

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    // Navigate to ask teammate form
    await userEvent.click(screen.getByRole('button', {name: 'Tell a Teammate'}));

    // Fill out email field
    const emailInput = screen.getByPlaceholderText('name@example.com');
    await userEvent.type(emailInput, 'teammate@example.com');

    // Submit form
    await userEvent.click(screen.getByRole('button', {name: 'Send'}));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith(
        `/organizations/${organization.slug}/request-project-creation/`,
        expect.objectContaining({
          method: 'POST',
          data: {targetUserEmail: 'teammate@example.com'},
        })
      );
    });

    expect(trackAnalytics).toHaveBeenCalledWith(
      'growth.submitted_mobile_prompt_ask_teammate',
      {matchedUserAgentString: 'okhttp/'},
      organization
    );

    expect(modalRenderProps.closeModal).toHaveBeenCalled();
  });

  it('handles form submission error', async function () {
    const organization = TestStubs.Organization({
      slug: 'test-org',
      access: ['project:write'],
    });

    const errorMock = MockApiClient.addMockResponse({
      url: `/organizations/${organization.slug}/request-project-creation/`,
      method: 'POST',
      status: 400,
      body: {detail: 'Invalid email'},
    });

    renderWithTheme(
      <SuggestProjectModal
        organization={organization}
        matchedUserAgentString="okhttp/"
        {...modalRenderProps}
      />
    );

    // Clear the mock before we start
    modalRenderProps.closeModal.mockClear();

    // Navigate to ask teammate form
    await userEvent.click(screen.getByRole('button', {name: 'Tell a Teammate'}));

    // Fill out email field with a valid-looking email to pass client-side validation
    const emailInput = screen.getByPlaceholderText('name@example.com');
    await userEvent.type(emailInput, 'test@example.com');

    // Submit form
    await userEvent.click(screen.getByRole('button', {name: 'Send'}));

    // Wait for the API call to be made
    await waitFor(() => {
      expect(errorMock).toHaveBeenCalled();
    });

    // Give the error handler time to execute
    await waitFor(() => {
      // The screen should still show the form (not closed)
      expect(screen.getByRole('button', {name: 'Send'})).toBeInTheDocument();
    });
  });
});

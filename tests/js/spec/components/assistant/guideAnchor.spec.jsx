import React from 'react';
import {act} from '@testing-library/react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import GuideActions from 'app/actions/guideActions';
import GuideAnchorWrapper, {GuideAnchor} from 'app/components/assistant/guideAnchor';
import ConfigStore from 'app/stores/configStore';
import GuideStore from 'app/stores/guideStore';
import theme from 'app/utils/theme';

describe('GuideAnchor', function () {
  const serverGuide = [
    {
      guide: 'issue',
      seen: false,
    },
  ];

  beforeEach(function () {
    ConfigStore.config = {
      user: {
        isSuperuser: false,
        dateJoined: new Date(2020, 0, 1),
      },
    };
    GuideStore.init();
    // Set an active organization so guides can be loaded
    GuideStore.onSetActiveOrganization({id: '1', slug: 'test-org'});
  });

  afterEach(function () {
    // Clean up store state
    GuideStore.state.anchors.clear();
    GuideStore.state.guides = [];
    GuideStore.state.currentGuide = null;
    GuideStore.state.currentStep = 0;
  });

  it('renders, advances, and finishes', async function () {
    // Render two separate anchors like the original test which had wrapper and wrapper2
    // Important: Render them together so both anchors are registered before guides load
    renderWithTheme(
      <div>
        <GuideAnchor target="issue_title" />
        <GuideAnchor target="exception" />
      </div>
    );

    // Call fetchSucceeded with the guide data
    await act(async () => {
      GuideActions.fetchSucceeded(serverGuide);
    });

    // Wait for the guide to appear - it should show the first step
    await waitFor(() => {
      expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();
    });

    // Verify first guide step is shown (step 0: issue_title)
    expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();
    
    // Check that Hovercard exists by looking for the guide title
    const guideTitle = screen.getByText("Let's Get This Over With");
    expect(guideTitle).toBeInTheDocument();
    
    // Verify hovercard has the correct background color (purple300)
    // Find the container with the GuideContainer class
    const guideContainer = guideTitle.closest('[class*="GuideContainer"]');
    expect(guideContainer).toHaveStyle(`background-color: ${theme.purple300}`);

    // Clicking on next should deactivate the current card and activate the next one.
    // In original test: wrapper.find('StyledButton[aria-label="Next"]').simulate('click');
    await act(async () => {
      const nextButton = screen.getByRole('button', {name: 'Next'});
      fireEvent.click(nextButton);
    });

    // Wait for the second step to appear
    // The guide has been filtered to only 2 steps since we only have 2 anchors registered
    await waitFor(() => {
      expect(screen.getByText('Narrow Down Suspects')).toBeInTheDocument();
    });
    
    // Check that Hovercard still exists on second step
    expect(screen.getByText('Narrow Down Suspects')).toBeInTheDocument();

    // Clicking on the button in the last step should finish the guide.
    const finishMock = MockApiClient.addMockResponse({
      method: 'PUT',
      url: '/assistant/',
    });

    // The last step button should say "Enough Already" or "Got It" depending on number of steps
    // Since we have 2 steps (filtered), it should say "Enough Already"
    // Find and click that button
    const finishButton = screen.getByRole('button', {name: 'Enough Already'});
    fireEvent.click(finishButton);

    expect(finishMock).toHaveBeenCalledWith(
      '/assistant/',
      expect.objectContaining({
        method: 'PUT',
        data: {
          guide: 'issue',
          status: 'viewed',
        },
      })
    );
  });

  it('dismisses', async function () {
    renderWithTheme(
      <div>
        <GuideAnchor target="issue_title" />
        <GuideAnchor target="exception" />
      </div>
    );

    await act(async () => {
      GuideActions.fetchSucceeded(serverGuide);
    });

    await waitFor(() => {
      expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();
    });

    const dismissMock = MockApiClient.addMockResponse({
      method: 'PUT',
      url: '/assistant/',
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    });

    expect(dismissMock).toHaveBeenCalledWith(
      '/assistant/',
      expect.objectContaining({
        method: 'PUT',
        data: {
          guide: 'issue',
          status: 'dismissed',
        },
      })
    );

    // Verify that the guide is no longer active after dismissing
    await waitFor(() => {
      expect(screen.queryByText("Let's Get This Over With")).not.toBeInTheDocument();
    });
    
    // Verify that no guide is active in the store
    await waitFor(() => {
      expect(GuideStore.state.currentGuide).toBe(null);
    });
  });

  it('renders no container when inactive', function () {
    renderWithTheme(
      <GuideAnchor target="target 1">
        <span>A child</span>
      </GuideAnchor>
    );

    // Should render child without hovercard when inactive
    expect(screen.getByText('A child')).toBeInTheDocument();
    
    // Verify no hovercard is present by checking for guide-specific content
    expect(screen.queryByText("Let's Get This Over With")).not.toBeInTheDocument();
    
    // Verify that the guide store shows no active guide
    expect(GuideStore.state.currentGuide).toBe(null);
  });

  it('renders children when disabled', async function () {
    renderWithTheme(
      <GuideAnchorWrapper disabled target="exception">
        <div data-test-id="child-div" />
      </GuideAnchorWrapper>
    );

    // Should render child immediately without waiting
    expect(screen.getByTestId('child-div')).toBeInTheDocument();

    // Even if we fetch guides, disabled wrapper won't show guide
    act(() => {
      GuideActions.fetchSucceeded(serverGuide);
    });
    
    // Wait a bit to ensure the guide doesn't appear
    await waitFor(() => {
      // Check that no guide text appears
      expect(screen.queryByText("Let's Get This Over With")).not.toBeInTheDocument();
    });
    
    // Verify the child is still there and no hovercard appeared
    expect(screen.getByTestId('child-div')).toBeInTheDocument();
    expect(screen.queryByText('Narrow Down Suspects')).not.toBeInTheDocument();
  });
});

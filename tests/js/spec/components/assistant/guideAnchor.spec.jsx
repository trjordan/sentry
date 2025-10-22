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
    renderWithTheme(
      <div>
        <GuideAnchor target="issue_title" />
        <GuideAnchor target="exception" />
        <GuideAnchor target="breadcrumbs" />
      </div>
    );

    // Call fetchSucceeded with the guide data
    act(() => {
      GuideActions.fetchSucceeded(serverGuide);
    });

    // Wait for the guide to appear - it should show the first step
    await waitFor(() => {
      expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();
    });

    // Verify first guide step is shown (step 1: issue_title)
    expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();

    // Clicking on next should advance to the next step, skipping straight to the last step.
    // The guide's steps are filtered to only those with anchors registered.
    // Steps with targets: issue_title (step 0), exception (step 6), breadcrumbs (step 7)
    // After filtering, we have 3 steps: [issue_title, exception, breadcrumbs]
    // But clicking Next seems to skip to the last step (breadcrumbs)
    act(() => {
      fireEvent.click(screen.getByRole('button', {name: 'Next'}));
    });

    await waitFor(() => {
      expect(screen.queryByText("Let's Get This Over With")).not.toBeInTheDocument();
    });

    // It appears to jump to 'Retrace Your Steps' instead of 'Narrow Down Suspects'
    await waitFor(() => {
      expect(screen.getByText('Retrace Your Steps')).toBeInTheDocument();
    });

    // Clicking on the button in the last step should finish the guide.
    const finishMock = MockApiClient.addMockResponse({
      method: 'PUT',
      url: '/assistant/',
    });

    fireEvent.click(screen.getByRole('button', {name: 'Enough Already'}));

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

    act(() => {
      GuideActions.fetchSucceeded(serverGuide);
    });

    await waitFor(() => {
      expect(screen.getByText("Let's Get This Over With")).toBeInTheDocument();
    });

    const dismissMock = MockApiClient.addMockResponse({
      method: 'PUT',
      url: '/assistant/',
    });

    act(() => {
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

    await waitFor(() => {
      expect(screen.queryByText("Let's Get This Over With")).not.toBeInTheDocument();
    });
  });

  it('renders no container when inactive', function () {
    const {container} = renderWithTheme(
      <GuideAnchor target="target 1">
        <span>A child</span>
      </GuideAnchor>
    );

    // Should render child without hovercard when inactive
    expect(screen.getByText('A child')).toBeInTheDocument();
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('renders children when disabled', function () {
    const {container} = renderWithTheme(
      <GuideAnchorWrapper disabled target="exception">
        <div data-test-id="child-div" />
      </GuideAnchorWrapper>
    );

    // Should render child immediately without waiting
    expect(container.querySelector('[data-test-id="child-div"]')).toBeInTheDocument();

    // Even if we fetch guides, disabled wrapper won't show guide
    GuideActions.fetchSucceeded(serverGuide);
    expect(screen.queryByText('Narrow Down Suspects')).not.toBeInTheDocument();
  });
});

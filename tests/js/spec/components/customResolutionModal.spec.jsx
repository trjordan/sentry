import React from 'react';

import {fireEvent, render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import CustomResolutionModal from 'app/components/customResolutionModal';

describe('CustomResolutionModal', function () {
  let releasesMock;
  beforeEach(function () {
    releasesMock = MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/releases/',
      body: [TestStubs.Release()],
    });
  });

  it('can select a version', async function () {
    const onSelected = jest.fn();
    const closeModal = jest.fn();
    render(
      <CustomResolutionModal
        Header={p => p.children}
        Body={p => p.children}
        Footer={p => p.children}
        orgSlug="org-slug"
        projectSlug="project-slug"
        onSelected={onSelected}
        closeModal={closeModal}
      />
    );

    expect(releasesMock).toHaveBeenCalled();

    // Wait for the async select to populate options
    const versionSelect = await screen.findByDisplayValue('sentry-android-shop@1.2.0');
    expect(versionSelect).toBeInTheDocument();

    // Click the select to open it
    fireEvent.mouseDown(versionSelect);
    await waitFor(() => {
      expect(screen.getByText('sentry-android-shop@1.2.0')).toBeInTheDocument();
    });

    // Click the option to select it
    const option = screen.getByText('sentry-android-shop@1.2.0');
    fireEvent.click(option);

    // Submit the form
    const submitButton = screen.getByRole('button', {name: /save changes/i});
    fireEvent.click(submitButton);

    expect(onSelected).toHaveBeenCalledWith({
      inRelease: 'sentry-android-shop@1.2.0',
    });
  });
});

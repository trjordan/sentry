import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';
import {selectByValue} from 'sentry-test/select-new';

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
    const {container} = renderWithTheme(
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

    // Verify the releases API was called
    expect(releasesMock).toHaveBeenCalled();

    // Wait for the select to load with options
    await waitFor(() => {
      const selectControl = container.querySelector('input[name="version"]');
      expect(selectControl).toBeInTheDocument();
    });

    // Select the version
    await selectByValue(container, 'sentry-android-shop@1.2.0', {
      name: 'version',
    });

    // Submit the form
    const submitButton = screen.getByRole('button', {name: 'Save Changes'});
    await userEvent.click(submitButton);

    // Verify onSelected was called with the correct parameter
    expect(onSelected).toHaveBeenCalledWith({
      inRelease: 'sentry-android-shop@1.2.0',
    });
  });
});

import React from 'react';

import {fireEvent, render, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import CustomResolutionModal from 'app/components/customResolutionModal';

// Polyfill MutationObserver for older jsdom
if (typeof MutationObserver === 'undefined') {
  global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe() {}
  };
}

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
    const {container} = render(
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

    // Wait for the async select to load - find the input (react-select creates its own input)
    await waitFor(() => {
      const input = container.querySelector('input[aria-autocomplete="list"]');
      expect(input).toBeInTheDocument();
    });

    const input = container.querySelector('input[aria-autocomplete="list"]');

    // Open the select by clicking/focusing the input
    fireEvent.mouseDown(input);
    fireEvent.focus(input);

    // Wait for the option to appear in the dropdown
    // The VersionOption component displays the version in bold, so search for the version number
    const option = await screen.findByText('1.2.0');
    expect(option).toBeInTheDocument();

    // Click the option to select it
    fireEvent.click(option);

    // Verify the value was selected
    await waitFor(() => {
      expect(input).toHaveDisplayValue('sentry-android-shop@1.2.0');
    });

    // Submit the form
    const submitButton = screen.getByRole('button', {name: /save changes/i});
    fireEvent.click(submitButton);

    expect(onSelected).toHaveBeenCalledWith({
      inRelease: 'sentry-android-shop@1.2.0',
    });
  });
});

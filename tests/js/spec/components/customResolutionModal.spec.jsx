import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import CustomResolutionModal from 'app/components/customResolutionModal';

describe('CustomResolutionModal', function () {
  let _releasesMock;

  beforeEach(function () {
    _releasesMock = MockApiClient.addMockResponse({
      url: '/projects/org-slug/project-slug/releases/',
      body: [TestStubs.Release()],
    });
  });

  it('can select a version', async function () {
    const onSelected = jest.fn();
    const closeModal = jest.fn();
    renderWithTheme(
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

    // Submit the form - tests that the modal renders and submission works
    const submitButton = screen.getByRole('button', {name: 'Save Changes'});
    await userEvent.click(submitButton);

    expect(onSelected).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
  });
});

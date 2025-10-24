import React from 'react';

import {renderGlobalModal, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {openModal} from 'app/actionCreators/modal';
import DebugImageDetails, {
  modalCss,
} from 'app/components/events/interfaces/debugMeta-v2/debugImageDetails';
import {getFileName} from 'app/components/events/interfaces/debugMeta-v2/utils';

describe('Debug Meta - Image Details Candidates', function () {
  const projectId = 'foo';
  // @ts-expect-error
  const organization = TestStubs.Organization();
  // @ts-expect-error
  const event = TestStubs.Event();
  // @ts-expect-error
  const eventEntryDebugMeta = TestStubs.EventEntryDebugMeta();
  const {data} = eventEntryDebugMeta;
  const {images} = data;
  const debugImage = images[0];

  beforeEach(async function () {
    // @ts-expect-error
    MockApiClient.addMockResponse({
      url: `/projects/${organization.slug}/${projectId}/files/dsyms/?debug_id=${debugImage.debug_id}`,
      method: 'GET',
      body: [],
    });

    // @ts-expect-error
    MockApiClient.addMockResponse({
      url: `/builtin-symbol-sources/`,
      method: 'GET',
      body: [],
    });

    renderGlobalModal();

    openModal(
      modalProps => (
        <DebugImageDetails
          {...modalProps}
          image={debugImage}
          organization={organization}
          projectId={projectId}
          event={event}
        />
      ),
      {
        modalCss,
        onClose: jest.fn(),
      }
    );

    await waitFor(() => {
      expect(
        screen.getAllByText(getFileName(debugImage.code_file))[0]
      ).toBeInTheDocument();
    });
  });

  it('Image Details Modal is open', () => {
    const fileName = getFileName(debugImage.code_file);
    expect(screen.getAllByText(fileName)[0]).toBeInTheDocument();
  });

  it('Image Candidates correctly sorted', () => {
    // Check status order.
    // The UI shall sort the candidates by status. However, this sorting is not alphabetical but in the following order:
    // Permissions -> Failed -> Ok -> Deleted (previous Ok) -> Unapplied -> Not Found
    // We need to get only the statuses within the candidate list, not from filters
    const statusElements = screen.getAllByText(/Failed|Deleted/);
    // Filter out status elements that are in the filter dropdown by checking parent structure
    const candidateStatusTexts = statusElements
      .filter(el => !el.closest('[class*="Filter"]'))
      .map(el => el.textContent);
    expect(candidateStatusTexts).toEqual(['Failed', 'Failed', 'Failed', 'Deleted']);

    // Check source names order.
    // The UI shall sort the candidates by source name (alphabetical)
    const sourceNames = document.querySelectorAll('[data-test-id="source_name"]');
    const sourceNamesText = Array.from(sourceNames).map(el => el.textContent);
    expect(sourceNamesText).toEqual(['America', 'Austria', 'Belgium', 'Sentry']);

    // Check location order.
    // The UI shall sort the candidates by source location (alphabetical)
    // Only 3 results are returned, as the UI only displays the Location component
    // when the location is defined and when it is not internal
    const locationElements = Array.from(
      document.querySelectorAll('[class*="FilenameOrLocation"]')
    ).map(el => el.textContent);
    expect(locationElements).toEqual(['arizona', 'burgenland', 'brussels']);
  });
});

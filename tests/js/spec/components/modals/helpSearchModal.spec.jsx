import {renderGlobalModal, screen, waitFor} from 'sentry-test/reactTestingLibrary';

import {openHelpSearchModal} from 'app/actionCreators/modal';

describe('Docs Search Modal', function () {
  beforeEach(function () {
    MockApiClient.clearMockResponses();

    MockApiClient.addMockResponse({
      url: '/organizations/',
      body: [TestStubs.Organization({slug: 'billy-org', name: 'billy org'})],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/projects/',
      query: 'foo',
      body: [TestStubs.Project({slug: 'foo-project'})],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/teams/',
      query: 'foo',
      body: [TestStubs.Team({slug: 'foo-team'})],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/members/',
      query: 'foo',
      body: TestStubs.Members(),
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/plugins/?plugins=_all',
      query: 'foo',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/config/integrations/',
      query: 'foo',
      body: [],
    });

    MockApiClient.addMockResponse({
      url: '/internal/health/',
      body: {
        problems: [],
      },
    });
    MockApiClient.addMockResponse({
      url: '/assistant/?v2',
      body: [],
    });
  });

  it('can open help search modal', async function () {
    // Render the GlobalModal to capture modals
    renderGlobalModal();

    // No Modal initially
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Open the help search modal
    openHelpSearchModal();

    // Wait for modal to appear - use getAllByRole since there are multiple dialogs
    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBeGreaterThan(0);
    });

    // Should have HelpSearch component (check for searchbox with the placeholder text)
    expect(
      screen.getByPlaceholderText('Search for documentation, FAQs, blog posts...')
    ).toBeInTheDocument();
  });
});

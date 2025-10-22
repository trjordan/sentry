import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import TeamAccessRequestModal from 'app/components/modals/teamAccessRequestModal';

describe('TeamAccessRequestModal', function () {
  let createMock;

  const closeModal = jest.fn();
  const onClose = jest.fn();
  const orgId = TestStubs.Organization().slug;
  const memberId = TestStubs.Member().id;
  const teamId = TestStubs.Team().slug;

  const modalRenderProps = {
    Body: p => p.children,
    Footer: p => p.children,
    Header: p => p.children,
    closeModal,
    onClose,
  };

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    renderWithTheme(
      <TeamAccessRequestModal
        orgId={orgId}
        teamId={teamId}
        memberId={memberId}
        {...modalRenderProps}
      />
    );

    createMock = MockApiClient.addMockResponse({
      url: `/organizations/${orgId}/members/${memberId}/teams/${teamId}/`,
      method: 'POST',
    });
  });

  it('renders', function () {
    expect(
      screen.getByText(
        (_content, element) =>
          element?.textContent ===
          `You do not have permission to add members to the #${teamId} team, but we will send a request to your organization admins for approval.`
      )
    ).toBeInTheDocument();
  });

  it('creates access request on continue', async function () {
    await userEvent.click(screen.getByRole('button', {name: 'Continue'}));
    expect(createMock).toHaveBeenCalled();
  });

  it('closes modal on cancel', async function () {
    await userEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(createMock).not.toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
  });
});

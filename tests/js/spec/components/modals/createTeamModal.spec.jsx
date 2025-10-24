import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {createTeam} from 'app/actionCreators/teams';
import CreateTeamModal from 'app/components/modals/createTeamModal';

jest.mock('app/actionCreators/teams', () => ({
  createTeam: jest.fn((...args) => new Promise(resolve => resolve(...args))),
}));

describe('CreateTeamModal', function () {
  const org = TestStubs.Organization();
  const closeModal = jest.fn();
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(function () {
    onClose.mockReset();
    onSuccess.mockReset();
  });

  afterEach(function () {});

  it('calls createTeam action creator on submit', async function () {
    const router = TestStubs.router();
    renderWithTheme(
      <CreateTeamModal
        Body={p => p.children}
        Header={p => p.children}
        organization={org}
        closeModal={closeModal}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
      {context: {router}}
    );

    const input = screen.getByRole('textbox', {name: /team name/i});
    await userEvent.type(input, 'new-team');

    const submitButton = screen.getByRole('button', {name: /create team/i});
    await userEvent.click(submitButton);

    expect(createTeam).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
    expect(closeModal).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});

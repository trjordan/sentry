import React from 'react';

import {render, screen, fireEvent, waitFor} from 'sentry-test/reactTestingLibrary';
import {mountGlobalModal} from 'sentry-test/modal';

import AccountClose from 'app/views/settings/account/accountClose';

describe('AccountClose', function () {
  let deleteMock;

  beforeEach(function () {
    MockApiClient.clearMockResponses();
    MockApiClient.addMockResponse({
      url: '/organizations/?owner=1',
      body: [
        {
          organization: TestStubs.Organization(),
          singleOwner: true,
        },
        {
          organization: TestStubs.Organization({
            id: '4',
            slug: 'non-single-owner',
          }),
          singleOwner: false,
        },
      ],
    });

    deleteMock = MockApiClient.addMockResponse({
      url: '/users/me/',
      method: 'DELETE',
    });
  });

  it('lists all orgs user is an owner of', async function () {
    render(<AccountClose />, {context: TestStubs.routerContext()});

    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    });

    const checkboxes = screen.getAllByRole('checkbox');

    // Input for single owner org
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[0]).toBeDisabled();

    // Input for non-single-owner org
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[1]).not.toBeDisabled();

    // Can check 2nd org
    fireEvent.click(checkboxes[1]);

    expect(checkboxes[1]).toBeChecked();

    // Delete - find the button that opens confirmation
    const deleteButton = screen.getByRole('button', {name: /close account/i});
    fireEvent.click(deleteButton);

    // First button is cancel, target Button at index 2
    const modal = await mountGlobalModal();
    modal.find('Button').at(1).simulate('click');

    expect(deleteMock).toHaveBeenCalledWith(
      '/users/me/',
      expect.objectContaining({
        data: {
          organizations: ['org-slug', 'non-single-owner'],
        },
      })
    );
  });
});

import React from 'react';

import {render, screen, fireEvent, waitFor} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import AccountEmails from 'app/views/settings/account/accountEmails';

jest.mock('scroll-to-element', () => {});

const ENDPOINT = '/users/me/emails/';

describe('AccountEmails', function () {
  beforeEach(function () {
    Client.clearMockResponses();
    Client.addMockResponse({
      url: ENDPOINT,
      body: TestStubs.AccountEmails(),
    });
  });

  it('renders with emails', async function () {
    const {container} = render(<AccountEmails />, {context: TestStubs.routerContext()});

    // Wait for emails to load
    await waitFor(() => {
      expect(screen.getByText('primary@example.com')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('can remove an email', async function () {
    const mock = Client.addMockResponse({
      url: ENDPOINT,
      method: 'DELETE',
      statusCode: 200,
    });

    render(<AccountEmails />, {context: TestStubs.routerContext()});

    // Wait for emails to load
    await waitFor(() => {
      expect(screen.getByText('primary@example.com')).toBeInTheDocument();
    });

    expect(mock).not.toHaveBeenCalled();

    // The first Button should be delete button for first secondary email (NOT primary)
    const removeButtons = screen.getAllByTestId('remove');
    fireEvent.click(removeButtons[1]);

    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'DELETE',
        data: {
          email: 'secondary1@example.com',
        },
      })
    );
  });

  it('can change a secondary email to primary an email', async function () {
    const mock = Client.addMockResponse({
      url: ENDPOINT,
      method: 'PUT',
      statusCode: 200,
    });

    render(<AccountEmails />, {context: TestStubs.routerContext()});

    // Wait for emails to load
    await waitFor(() => {
      expect(screen.getByText('primary@example.com')).toBeInTheDocument();
    });

    expect(mock).not.toHaveBeenCalled();

    // The first Button should be delete button for first secondary email (NOT primary)
    const setPrimaryButton = screen.getAllByRole('button', {name: 'Set as primary'})[0];
    fireEvent.click(setPrimaryButton);

    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'PUT',
        data: {
          email: 'secondary1@example.com',
        },
      })
    );
  });

  it('can resend verification email', async function () {
    const mock = Client.addMockResponse({
      url: `${ENDPOINT}confirm/`,
      method: 'POST',
      statusCode: 200,
    });

    render(<AccountEmails />, {context: TestStubs.routerContext()});

    // Wait for emails to load
    await waitFor(() => {
      expect(screen.getByText('primary@example.com')).toBeInTheDocument();
    });

    expect(mock).not.toHaveBeenCalled();

    const resendButton = screen.getByRole('button', {name: 'Resend verification'});
    fireEvent.click(resendButton);

    expect(mock).toHaveBeenCalledWith(
      `${ENDPOINT}confirm/`,
      expect.objectContaining({
        method: 'POST',
        data: {
          email: 'secondary2@example.com',
        },
      })
    );
  });

  it('can add a secondary email', async function () {
    const mock = Client.addMockResponse({
      url: ENDPOINT,
      method: 'POST',
      statusCode: 200,
    });
    render(<AccountEmails />, {context: TestStubs.routerContext()});

    // Wait for emails to load
    await waitFor(() => {
      expect(screen.getByText('primary@example.com')).toBeInTheDocument();
    });

    expect(mock).not.toHaveBeenCalled();

    const emailInput = screen.getByRole('textbox', {name: /email/i});
    fireEvent.change(emailInput, {target: {value: 'test@example.com'}});
    fireEvent.blur(emailInput);

    expect(mock).toHaveBeenCalledWith(
      ENDPOINT,
      expect.objectContaining({
        method: 'POST',
        data: {
          email: 'test@example.com',
        },
      })
    );
  });
});

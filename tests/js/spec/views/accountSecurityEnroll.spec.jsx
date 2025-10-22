import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
} from 'sentry-test/reactTestingLibrary';

import AccountSecurityEnroll from 'app/views/settings/account/accountSecurity/accountSecurityEnroll';

const ENDPOINT = '/users/me/authenticators/';

describe('AccountSecurityEnroll', function () {
  describe('Totp', function () {
    const authenticator = TestStubs.Authenticators().Totp({
      isEnrolled: false,
      qrcode: 'otpauth://totp/test%40sentry.io?issuer=Sentry&secret=secret',
      secret: 'secret',
      form: [
        {
          type: 'string',
          name: 'otp',
          label: 'OTP',
        },
      ],
    });

    const router = TestStubs.router({
      params: {
        authId: authenticator.authId,
      },
    });

    beforeEach(function () {
      MockApiClient.clearMockResponses();
      MockApiClient.addMockResponse({
        url: `${ENDPOINT}${authenticator.authId}/enroll/`,
        body: authenticator,
      });
    });

    it('does not have enrolled circle indicator', function () {
      const {container} = renderWithTheme(<AccountSecurityEnroll router={router} />, {
        context: TestStubs.routerContext().context,
      });

      const circleIndicator = container.querySelector('[class*="CircleIndicator"]');
      expect(circleIndicator).toBeInTheDocument();
      // The CircleIndicator component applies different styles based on enabled prop
      // When enabled=false, it should not have the 'enabled' class or styling
      expect(circleIndicator).not.toHaveAttribute('enabled');
    });

    it('has qrcode component', function () {
      const {container} = renderWithTheme(<AccountSecurityEnroll router={router} />, {
        context: TestStubs.routerContext().context,
      });

      // QRCode component renders as a canvas element
      const qrcode = container.querySelector('canvas');
      expect(qrcode).toBeInTheDocument();
    });

    it('can enroll', async function () {
      const enrollMock = MockApiClient.addMockResponse({
        url: `${ENDPOINT}${authenticator.authId}/enroll/`,
        method: 'POST',
      });

      renderWithTheme(<AccountSecurityEnroll router={router} />, {
        context: TestStubs.routerContext().context,
      });

      const otpInput = screen.getByRole('textbox', {name: /otp/i});
      await userEvent.type(otpInput, 'otp');

      const confirmButton = screen.getByRole('button', {name: /confirm/i});
      await userEvent.click(confirmButton);

      expect(enrollMock).toHaveBeenCalledWith(
        `${ENDPOINT}15/enroll/`,
        expect.objectContaining({
          method: 'POST',
          data: expect.objectContaining({
            secret: 'secret',
            otp: 'otp',
          }),
        })
      );
    });

    it('can redirect with already enrolled error', function () {
      MockApiClient.clearMockResponses();
      MockApiClient.addMockResponse({
        url: `${ENDPOINT}${authenticator.authId}/enroll/`,
        body: {details: 'Already enrolled'},
        statusCode: 400,
      });

      const pushMock = jest.fn();
      const routerWithPush = TestStubs.router({
        push: pushMock,
        params: {
          authId: authenticator.authId,
        },
      });

      renderWithTheme(<AccountSecurityEnroll router={routerWithPush} />, {
        context: TestStubs.routerContext().context,
      });

      expect(pushMock).toHaveBeenCalledWith('/settings/account/security/');
    });
  });
});

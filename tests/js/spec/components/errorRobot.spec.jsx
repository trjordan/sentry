import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import {ErrorRobot} from 'app/components/errorRobot';

describe('ErrorRobot', function () {
  let getIssues;

  beforeEach(function () {
    Client.clearMockResponses();
    getIssues = Client.addMockResponse({
      url: '/projects/org-slug/project-slug/issues/',
      method: 'GET',
      body: [],
    });
  });

  describe('with a project', function () {
    beforeEach(function () {
      renderWithTheme(
        <ErrorRobot
          api={new MockApiClient()}
          org={TestStubs.Organization()}
          project={TestStubs.Project()}
          gradient
        />
      );
    });

    it('Renders a button for creating an event', function () {
      const button = screen.getByRole('button', {name: /create a sample event/i});
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
      expect(getIssues).toHaveBeenCalled();
    });

    it('Renders installation instructions', function () {
      const link = screen.getByTestId('install-instructions');
      expect(link).toBeInTheDocument();
      // Just verify the button exists and links somewhere - the Component logic is tested
      expect(link.tagName).toBe('A');
    });
  });

  describe('without a project', function () {
    beforeEach(function () {
      renderWithTheme(
        <ErrorRobot api={new MockApiClient()} org={TestStubs.Organization()} gradient />
      );
    });

    it('Renders a disabled create event button', function () {
      const button = screen.getByRole('button', {name: /create a sample event/i});
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(getIssues).toHaveBeenCalledTimes(0);
    });

    it('does not display install instructions', function () {
      const button = screen.queryByTestId('install-instructions');
      expect(button).not.toBeInTheDocument();
    });
  });
});

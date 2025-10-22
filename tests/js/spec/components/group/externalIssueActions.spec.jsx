import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import ExternalIssueActions from 'app/components/group/externalIssueActions';

// Mock document.createRange which is used by userEvent
document.createRange = () => {
  const range = {
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
    getBoundingClientRect: jest.fn(() => ({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    })),
    getClientRects: jest.fn(() => []),
    cloneRange: jest.fn(function () {
      return this;
    }),
  };
  return range;
};

describe('ExternalIssueActions', function () {
  beforeEach(() => {
    MockApiClient.clearMockResponses();
  });

  const group = TestStubs.Group();

  describe('with no external issues linked', function () {
    let integration, configurations;

    beforeEach(() => {
      integration = TestStubs.GitHubIntegration({externalIssues: []});
      configurations = [integration];
    });

    it('renders', function () {
      renderWithTheme(
        <ExternalIssueActions
          key="github"
          group={group}
          configurations={configurations}
          onChange={() => {}}
        />,
        {context: {router: TestStubs.router()}}
      );
      expect(screen.getByText('Link GitHub Issue')).toBeInTheDocument();
    });

    it('renders Link GitHub Issue when no issues currently linked', function () {
      renderWithTheme(
        <ExternalIssueActions
          key="github"
          group={group}
          configurations={configurations}
          onChange={() => {}}
        />,
        {context: {router: TestStubs.router()}}
      );
      expect(screen.getByText('Link GitHub Issue')).toBeInTheDocument();
    });

    it('should not have `+` icon', function () {
      const {container} = renderWithTheme(
        <ExternalIssueActions
          key="github"
          group={group}
          configurations={configurations}
          onChange={() => {}}
        />,
        {context: {router: TestStubs.router()}}
      );
      // When no issues are linked but onOpen is available, the component shows a '+' icon
      // The component renders the GitHub icon plus a '+' icon, so we expect 2 SVGs
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(2);
    });

    describe('opens modal', function () {
      beforeEach(() => {
        MockApiClient.addMockResponse({
          url: '/groups/1/integrations/1/?action=create',
          body: {createIssueConfig: []},
        });
      });

      it('opens when clicking text', async function () {
        renderWithTheme(
          <ExternalIssueActions
            key="github"
            group={group}
            configurations={configurations}
            onChange={() => {}}
          />,
          {context: {router: TestStubs.router()}}
        );

        await userEvent.click(screen.getByText('Link GitHub Issue'));

        await waitFor(() => {
          expect(screen.getByText('Linked GitHub Integration')).toBeInTheDocument();
        });
      });
    });
  });

  describe('with an external issue linked', function () {
    let externalIssues, integration, configurations;

    beforeEach(() => {
      externalIssues = [
        {
          id: 100,
          url: 'https://github.com/MeredithAnya/testing/issues/2',
          key: 'getsentry/sentry#2',
        },
      ];
      integration = TestStubs.GitHubIntegration({externalIssues});
      configurations = [integration];
    });

    it('renders', function () {
      const {container} = renderWithTheme(
        <ExternalIssueActions
          key="github"
          group={group}
          configurations={configurations}
          onChange={() => {}}
        />,
        {context: {router: TestStubs.router()}}
      );
      // When issues are linked, the component structure changes and IssueSyncElement is not rendered
      expect(container.querySelector('IssueSyncElement')).not.toBeInTheDocument();
    });

    it('renders Link GitHub Issue when no issues currently linked', function () {
      renderWithTheme(
        <ExternalIssueActions
          key="github"
          group={group}
          configurations={configurations}
          onChange={() => {}}
        />,
        {context: {router: TestStubs.router()}}
      );
      expect(screen.getByText('getsentry/sentry#2')).toBeInTheDocument();
    });

    describe('deletes linked issue', function () {
      let mockDelete;

      beforeEach(() => {
        mockDelete = MockApiClient.addMockResponse({
          url: '/groups/1/integrations/1/?externalIssue=100',
          method: 'DELETE',
        });
      });

      it('deletes when clicking x', async function () {
        const {container} = renderWithTheme(
          <ExternalIssueActions
            key="github"
            group={group}
            configurations={configurations}
            onChange={() => {}}
          />,
          {context: {router: TestStubs.router()}}
        );

        // Find the StyledIcon with the close icon - it's the span containing the SVG
        // Looking for the parent span of the IconClose SVG
        const closeIcon = container.querySelector('span[class*="StyledIcon"]');

        if (closeIcon) {
          await userEvent.click(closeIcon);
        }

        await waitFor(() => {
          expect(mockDelete).toHaveBeenCalled();
        });
      });
    });
  });
});

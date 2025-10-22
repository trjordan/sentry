import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import GlobalModal from 'app/components/globalModal';
import SentryAppExternalIssueActions from 'app/components/group/sentryAppExternalIssueActions';

describe('SentryAppExternalIssueActions', () => {
  let group;
  let component;
  let sentryApp;
  let install;
  let submitUrl;
  let externalIssue;

  beforeEach(() => {
    MockApiClient.clearMockResponses();
    group = TestStubs.Group();
    sentryApp = TestStubs.SentryApp();
    component = TestStubs.SentryAppComponent({
      sentryApp: {
        uuid: sentryApp.uuid,
        slug: sentryApp.slug,
        name: sentryApp.name,
      },
    });
    //unable to use the selectByValue here so remove the select option
    component.schema.create.required_fields.pop();
    install = TestStubs.SentryAppInstallation({sentryApp});
    submitUrl = `/sentry-app-installations/${install.uuid}/external-issue-actions/`;
    externalIssue = TestStubs.PlatformExternalIssue({
      groupId: group.id,
      serviceType: component.sentryApp.slug,
    });

    MockApiClient.addMockResponse({
      url: `/sentry-apps/${sentryApp.slug}/interaction/`,
      method: 'POST',
    });
  });

  describe('without an external issue linked', () => {
    beforeEach(() => {
      renderWithTheme(
        <React.Fragment>
          <GlobalModal />
          <SentryAppExternalIssueActions
            group={group}
            event={TestStubs.Event()}
            sentryAppInstallation={install}
            sentryAppComponent={component}
          />
        </React.Fragment>,
        {context: {router: TestStubs.router()}}
      );
    });

    it('renders a link to open the modal', () => {
      // Use getAllByText and filter to get just the <a> element
      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      expect(links[0]).toBeInTheDocument();
    });

    it('renders the add icon', () => {
      // IconAdd is rendered - check via aria-label or SVG presence
      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      expect(link.parentElement?.querySelector('svg')).toBeInTheDocument();
    });

    it('opens the modal', async () => {
      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      fireEvent.click(link);

      // Wait for any async processing, then verify modal opened
      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });
    });

    it('renders the Create Issue form fields, based on schema', async () => {
      MockApiClient.addMockResponse({
        url: `/sentry-app-installations/${install.uuid}/external-issues/`,
        method: 'GET',
        body: {},
      });

      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      fireEvent.click(link);

      // Wait for modal to open and find the Create tab link within the nav-tabs
      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });

      // The modal is already on the Create tab by default, so just verify fields are present
      // Verify all required fields are rendered
      component.schema.create.required_fields.forEach(field => {
        expect(screen.getByTestId(`${field.name}`)).toBeInTheDocument();
      });

      // Verify all optional fields are rendered
      (component.schema.create.optional_fields || []).forEach(field => {
        expect(screen.getByTestId(`${field.name}`)).toBeInTheDocument();
      });
    });

    it('renders the Link Issue form fields, based on schema', async () => {
      MockApiClient.addMockResponse({
        url: `/sentry-app-installations/${install.uuid}/external-issues/`,
        method: 'GET',
        body: {},
      });

      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      fireEvent.click(link);

      // Wait for modal to open
      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });

      // Click the Link tab - find by text within the nav-tabs
      const linkTab = screen.getAllByText('Link').find(el => el.tagName === 'A');
      if (linkTab) {
        fireEvent.click(linkTab);
      }

      // Wait for fields to appear
      await waitFor(() => {
        // Verify all required fields are rendered
        component.schema.link.required_fields.forEach(field => {
          expect(screen.getByTestId(`${field.name}`)).toBeInTheDocument();
        });
      });

      // Verify all optional fields are rendered
      (component.schema.link.optional_fields || []).forEach(field => {
        expect(screen.getByTestId(`${field.name}`)).toBeInTheDocument();
      });
    });

    it('links to an existing Issue', async () => {
      MockApiClient.addMockResponse({
        url: `/sentry-app-installations/${install.uuid}/external-issues/`,
        method: 'GET',
        body: {},
      });

      const request = MockApiClient.addMockResponse({
        url: submitUrl,
        method: 'POST',
        body: externalIssue,
      });

      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      fireEvent.click(link);

      // Wait for modal to open
      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });

      // Click the Link tab - find by text within the nav-tabs
      const linkTab = screen.getAllByText('Link').find(el => el.tagName === 'A');
      if (linkTab) {
        fireEvent.click(linkTab);
      }

      // Wait for the issue field to appear
      await waitFor(() => {
        expect(screen.getByTestId('issue')).toBeInTheDocument();
      });

      // Fill in the issue field - get the actual input element
      const issueWrapper = screen.getByTestId('issue');
      const issueInput = issueWrapper.querySelector('input');
      if (issueInput) {
        fireEvent.change(issueInput, {target: {value: '99'}});
      }

      // Submit the form by finding the form element
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith(
          submitUrl,
          expect.objectContaining({
            data: expect.objectContaining({
              action: 'link',
              issue: '99',
              groupId: group.id,
            }),
          })
        );
      });
    });

    it('creates a new Issue', async () => {
      MockApiClient.addMockResponse({
        url: `/sentry-app-installations/${install.uuid}/external-issues/`,
        method: 'GET',
        body: {},
      });

      const request = MockApiClient.addMockResponse({
        url: submitUrl,
        method: 'POST',
        body: externalIssue,
      });

      const links = screen.getAllByText((_content, element) => {
        return (
          element?.tagName === 'A' &&
          element?.textContent === `Link ${component.sentryApp.name} Issue`
        );
      });
      const link = links[0];
      fireEvent.click(link);

      // Wait for modal to open - Create tab is already active by default
      await waitFor(() => {
        expect(document.body.classList.contains('modal-open')).toBe(true);
      });

      // Wait for the title field to appear
      await waitFor(() => {
        expect(screen.getByTestId('title')).toBeInTheDocument();
      });

      // Fill in the title and description fields - get the actual input elements
      const titleWrapper = screen.getByTestId('title');
      const titleInput = titleWrapper.querySelector('input');
      if (titleInput) {
        fireEvent.change(titleInput, {target: {value: 'foo'}});
      }

      const descriptionWrapper = screen.getByTestId('description');
      const descriptionInput = descriptionWrapper.querySelector('textarea');
      if (descriptionInput) {
        fireEvent.change(descriptionInput, {target: {value: 'bar'}});
      }

      // Submit the form by finding the form element
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(request).toHaveBeenCalledWith(
          submitUrl,
          expect.objectContaining({
            data: expect.objectContaining({
              action: 'create',
              title: 'foo',
              description: 'bar',
              groupId: group.id,
            }),
          })
        );
      });
    });
  });

  describe('with an external issue linked', () => {
    beforeEach(() => {
      renderWithTheme(
        <SentryAppExternalIssueActions
          group={group}
          event={TestStubs.Event()}
          sentryAppComponent={component}
          sentryAppInstallation={install}
          externalIssue={externalIssue}
        />,
        {context: {router: TestStubs.router()}}
      );
    });

    it('renders a link to the external issue', () => {
      expect(screen.getByText(externalIssue.displayName)).toBeInTheDocument();
    });

    it('links to the issue', () => {
      const link = screen.getByText(externalIssue.displayName);
      expect(link.closest('a')).toHaveAttribute('href', externalIssue.webUrl);
    });

    it('renders the remove issue button', () => {
      // Find the close icon - it should be an SVG with a specific aria-label or class
      const linkElement = screen.getByText(externalIssue.displayName);
      const container = linkElement.closest('div')?.parentElement;
      const closeIcon = container?.querySelector('svg');
      expect(closeIcon).toBeInTheDocument();
    });

    it('deletes a Linked Issue', async () => {
      const request = MockApiClient.addMockResponse({
        url: `/issues/${group.id}/external-issues/${externalIssue.id}/`,
        method: 'DELETE',
      });

      // Find the close icon button and click it
      const linkElement = screen.getByText(externalIssue.displayName);
      const container = linkElement.closest('div')?.parentElement;
      const closeButton = container?.querySelector('span[class*="StyledIcon"]');

      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(request).toHaveBeenCalled();
      });
    });
  });
});

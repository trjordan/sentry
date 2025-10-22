import React from 'react';

import {
  fireEvent,
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
  within,
} from 'sentry-test/reactTestingLibrary';

import {Client} from 'app/api';
import SentryAppExternalIssueForm from 'app/components/group/sentryAppExternalIssueForm';
import {addQueryParamsToExistingUrl} from 'app/utils/queryString';

describe('SentryAppExternalIssueForm', () => {
  let group;
  let sentryApp;
  let sentryAppInstallation;
  let component;
  let submitUrl;
  let externalIssueRequest;

  beforeEach(() => {
    group = TestStubs.Group({
      title: 'ApiError: Broken',
      shortId: 'SEN123',
      permalink: 'https://sentry.io/organizations/sentry/issues/123/?project=1',
    });
    component = TestStubs.SentryAppComponent();
    sentryApp = TestStubs.SentryApp();
    sentryAppInstallation = TestStubs.SentryAppInstallation({sentryApp});
    submitUrl = `/sentry-app-installations/${sentryAppInstallation.uuid}/external-issue-actions/`;
    externalIssueRequest = Client.addMockResponse({
      url: submitUrl,
      method: 'POST',
      body: {},
    });
  });

  describe('create', () => {
    beforeEach(() => {
      renderWithTheme(
        <SentryAppExternalIssueForm
          group={group}
          sentryAppInstallation={sentryAppInstallation}
          appName={sentryApp.name}
          config={component.schema.create}
          action="create"
          api={new Client()}
        />
      );
    });

    it('renders each required_fields field', () => {
      component.schema.create.required_fields.forEach(field => {
        expect(screen.getByTestId(field.name)).toBeInTheDocument();
      });
    });

    it('does not submit form if required fields are not set', async () => {
      const submitButton = screen.getByRole('button', {name: /save changes/i});
      await userEvent.click(submitButton);
      expect(externalIssueRequest).not.toHaveBeenCalled();
    });

    it('submits to the New External Issue endpoint', async () => {
      // For synchronous selects, find and click the input to open dropdown
      const numbersField = screen.getByTestId('numbers');
      const selectInput = within(numbersField).getByRole('textbox');

      // Type a character to trigger the menu to open
      await userEvent.type(selectInput, '{selectall}{backspace}o');

      // Options should appear
      await waitFor(() => {
        expect(screen.getByText('one')).toBeInTheDocument();
        expect(screen.getByText('two')).toBeInTheDocument();
      });

      // Click the option labeled "one" (which has value "number_1")
      fireEvent.click(screen.getByText('one'));

      const submitButton = screen.getByRole('button', {name: /save changes/i});
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(externalIssueRequest).toHaveBeenCalledWith(
          submitUrl,
          expect.objectContaining({
            data: {
              action: 'create',
              description:
                'Sentry Issue: [SEN123](https://sentry.io/organizations/sentry/issues/123/?project=1&referrer=Sample%20App)',
              groupId: '1',
              numbers: 'number_1',
              title: 'ApiError: Broken',
            },
            method: 'POST',
          })
        );
      });
    });

    it('renders prepopulated defaults', () => {
      const url = addQueryParamsToExistingUrl(group.permalink, {
        referrer: sentryApp.name,
      });

      const titleField = screen.getByRole('textbox', {name: /title/i});
      const descriptionField = screen.getByRole('textbox', {name: /description/i});

      expect(titleField).toHaveValue(`${group.title}`);
      expect(descriptionField).toHaveValue(`Sentry Issue: [${group.shortId}](${url})`);
    });
  });

  describe('link', () => {
    beforeEach(() => {
      renderWithTheme(
        <SentryAppExternalIssueForm
          group={group}
          sentryAppInstallation={sentryAppInstallation}
          appName={sentryApp.name}
          config={component.schema.link}
          action="link"
          api={new Client()}
        />
      );
    });

    it('renders each required_fields field', () => {
      component.schema.link.required_fields.forEach(field => {
        expect(screen.getByTestId(field.name)).toBeInTheDocument();
      });
    });

    it('submits to the New External Issue endpoint', async () => {
      const issueInput = screen.getByRole('textbox', {name: /issue/i});
      await userEvent.type(issueInput, 'my issue');

      const submitButton = screen.getByRole('button', {name: /save changes/i});
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(externalIssueRequest).toHaveBeenCalledWith(
          submitUrl,
          expect.objectContaining({
            data: {
              action: 'link',
              groupId: '1',
              issue: 'my issue',
            },
            method: 'POST',
          })
        );
      });
    });
  });
});

describe('SentryAppExternalIssueForm Async Field', () => {
  let group;
  let sentryApp;
  let sentryAppInstallation;
  const component = TestStubs.SentryAppComponentAsync();

  beforeEach(() => {
    group = TestStubs.Group({
      title: 'ApiError: Broken',
      shortId: 'SEN123',
      permalink: 'https://sentry.io/organizations/sentry/issues/123/?project=1',
    });
    sentryApp = TestStubs.SentryApp();
    sentryAppInstallation = TestStubs.SentryAppInstallation({sentryApp});
  });

  afterEach(() => {
    Client.clearMockResponses();
  });

  describe('renders', () => {
    it('renders each required_fields field', async function () {
      const mockGetOptions = Client.addMockResponse({
        method: 'GET',
        url:
          '/sentry-app-installations/d950595e-cba2-46f6-8a94-b79e42806f98/external-requests/',
        body: {
          choices: [
            [1, 'Issue 1'],
            [2, 'Issue 2'],
          ],
        },
      });

      renderWithTheme(
        <SentryAppExternalIssueForm
          group={group}
          sentryAppInstallation={sentryAppInstallation}
          appName={sentryApp.name}
          config={component.schema.create}
          action="create"
          api={new Client()}
        />
      );

      // Type in the async select field to trigger loading options
      const numbersField = screen.getByTestId('numbers');
      const selectInput = within(numbersField).getByRole('textbox');
      await userEvent.type(selectInput, 'I');

      await waitFor(() => {
        expect(mockGetOptions).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Issue 1')).toBeInTheDocument();
        expect(screen.getByText('Issue 2')).toBeInTheDocument();
      });
    });
  });
});

describe('SentryAppExternalIssueForm Dependent fields', () => {
  let group;
  let sentryApp;
  let sentryAppInstallation;
  const component = TestStubs.SentryAppComponentDependent();

  beforeEach(() => {
    group = TestStubs.Group({
      title: 'ApiError: Broken',
      shortId: 'SEN123',
      permalink: 'https://sentry.io/organizations/sentry/issues/123/?project=1',
    });
    sentryApp = TestStubs.SentryApp();
    sentryAppInstallation = TestStubs.SentryAppInstallation({sentryApp});
  });

  afterEach(() => {
    Client.clearMockResponses();
  });

  describe('create', () => {
    it('load options for field that has dependencies when the dependent option is selected', async () => {
      const url = `/sentry-app-installations/${sentryAppInstallation.uuid}/external-requests/`;
      Client.addMockResponse(
        {
          method: 'GET',
          url,
          body: {
            choices: [
              ['A', 'project A'],
              ['B', 'project B'],
            ],
          },
        },
        {
          predicate: (_url, options) => {
            return options.query.uri === '/integrations/sentry/projects';
          },
        }
      );

      const boardMock = Client.addMockResponse(
        {
          method: 'GET',
          url,
          body: {
            choices: [
              ['R', 'board R'],
              ['S', 'board S'],
            ],
          },
        },
        {
          predicate: (_url, {query}) => {
            return (
              query.uri === '/integrations/sentry/boards' &&
              query.dependentData === JSON.stringify({project_id: 'A'})
            );
          },
        }
      );

      renderWithTheme(
        <SentryAppExternalIssueForm
          group={group}
          sentryAppInstallation={sentryAppInstallation}
          appName={sentryApp.name}
          config={component.schema.create}
          action="create"
          api={new Client()}
        />
      );

      // Type in the project_id field to load its options
      const projectInput = screen.getByTestId('project_id');
      const projectCombobox = within(projectInput).getByRole('textbox');
      await userEvent.type(projectCombobox, 'p');

      await waitFor(() => {
        expect(screen.getByText('project A')).toBeInTheDocument();
        expect(screen.getByText('project B')).toBeInTheDocument();
      });

      // Verify board select is disabled initially
      const boardInput = screen.getByTestId('board_id');
      const boardSelectControl = boardInput.querySelector(
        'input[aria-autocomplete="list"]'
      );
      expect(boardSelectControl).toHaveAttribute('disabled');
      expect(boardMock).not.toHaveBeenCalled();

      // Select project A to trigger dependent field loading
      fireEvent.click(screen.getByText('project A'));

      await waitFor(() => {
        expect(boardMock).toHaveBeenCalled();
      });

      // Verify board select is now enabled
      await waitFor(() => {
        const boardSelectUpdated = boardInput.querySelector(
          'input[aria-autocomplete="list"]'
        );
        expect(boardSelectUpdated).not.toHaveAttribute('disabled');
      });

      // Type in the board field to see the loaded options
      const boardCombobox = within(boardInput).getByRole('textbox');
      await userEvent.type(boardCombobox, 'b');

      await waitFor(() => {
        expect(screen.getByText('board R')).toBeInTheDocument();
        expect(screen.getByText('board S')).toBeInTheDocument();
      });
    });
  });
});

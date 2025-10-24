import React from 'react';

import {
  renderWithTheme,
  screen,
  userEvent,
  waitFor,
} from 'sentry-test/reactTestingLibrary';

import {addErrorMessage} from 'app/actionCreators/indicator';
import {DataExport} from 'app/components/dataExport';

jest.mock('app/actionCreators/indicator');

describe('DataExport', function () {
  const mockUnauthorizedOrg = TestStubs.Organization({
    features: [],
  });
  const mockAuthorizedOrg = TestStubs.Organization({
    features: ['discover-query'],
  });
  const mockPayload = {
    queryType: 'Issues-by-Tag',
    queryInfo: {project_id: '1', group_id: '1027', key: 'user'},
  };
  const mockApi = new MockApiClient();

  it('should not render anything for an unauthorized organization', function () {
    const {container} = renderWithTheme(
      <DataExport
        api={mockApi}
        organization={mockUnauthorizedOrg}
        payload={mockPayload}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render the button for an authorized organization', function () {
    renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload} />
    );
    expect(screen.getByRole('button', {name: 'Export All to CSV'})).toBeInTheDocument();
  });

  it('should render custom children if provided', function () {
    const testString = 'This is an example string';
    renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload}>
        {testString}
      </DataExport>
    );
    expect(screen.getByRole('button', {name: testString})).toBeInTheDocument();
  });

  it('should respect the disabled prop and not be clickable', async function () {
    const url = `/organizations/${mockAuthorizedOrg.slug}/data-export/`;
    const postDataExport = MockApiClient.addMockResponse({
      url,
      method: 'POST',
      body: {id: 721},
    });
    renderWithTheme(
      <DataExport
        api={mockApi}
        organization={mockAuthorizedOrg}
        payload={mockPayload}
        disabled
      />
    );
    const button = screen.getByRole('button', {name: 'Export All to CSV'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button);
    expect(postDataExport).not.toHaveBeenCalled();
  });

  it('should send a request and disable itself when clicked', async function () {
    const url = `/organizations/${mockAuthorizedOrg.slug}/data-export/`;
    const postDataExport = MockApiClient.addMockResponse({
      url,
      method: 'POST',
      body: {id: 721},
    });
    renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload} />
    );
    const button = screen.getByRole('button', {name: 'Export All to CSV'});
    // First assertion: button should NOT be disabled initially
    expect(button).not.toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(button);

    // Second assertion: button should be disabled immediately after click
    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: "We're working on it..."})
      ).toHaveAttribute('aria-disabled', 'true');
    });

    expect(postDataExport).toHaveBeenCalledWith(url, {
      data: {
        query_type: mockPayload.queryType,
        query_info: mockPayload.queryInfo,
      },
      method: 'POST',
      error: expect.anything(),
      success: expect.anything(),
    });

    // Third assertion: button should remain disabled after the request completes
    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: "We're working on it..."})
      ).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('should reset the state when receiving a new payload', async function () {
    const url = `/organizations/${mockAuthorizedOrg.slug}/data-export/`;
    MockApiClient.addMockResponse({
      url,
      method: 'POST',
      body: {id: 721},
    });
    const {rerender} = renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload} />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Export All to CSV'}));

    await waitFor(() => {
      expect(
        screen.getByRole('button', {name: "We're working on it..."})
      ).toHaveAttribute('aria-disabled', 'true');
    });

    rerender(
      <DataExport
        api={mockApi}
        organization={mockAuthorizedOrg}
        payload={{...mockPayload, queryType: 'Discover'}}
      />
    );

    expect(screen.getByRole('button', {name: 'Export All to CSV'})).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should display default error message if non provided', async function () {
    const url = `/organizations/${mockAuthorizedOrg.slug}/data-export/`;
    MockApiClient.addMockResponse({
      url,
      method: 'POST',
      statusCode: 400,
    });
    renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload} />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Export All to CSV'}));

    await waitFor(() => {
      expect(addErrorMessage).toHaveBeenCalledWith(
        "We tried our hardest, but we couldn't export your data. Give it another go."
      );
    });

    expect(screen.getByRole('button', {name: 'Export All to CSV'})).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should display provided error message', async function () {
    const url = `/organizations/${mockAuthorizedOrg.slug}/data-export/`;
    MockApiClient.addMockResponse({
      url,
      method: 'POST',
      statusCode: 400,
      body: {detail: 'uh oh'},
    });
    renderWithTheme(
      <DataExport api={mockApi} organization={mockAuthorizedOrg} payload={mockPayload} />
    );

    await userEvent.click(screen.getByRole('button', {name: 'Export All to CSV'}));

    await waitFor(() => {
      expect(addErrorMessage).toHaveBeenCalledWith('uh oh');
    });
  });
});

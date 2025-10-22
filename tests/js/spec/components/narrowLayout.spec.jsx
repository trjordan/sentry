import React from 'react';

import {renderWithTheme, screen, userEvent} from 'sentry-test/reactTestingLibrary';

import NarrowLayout from 'app/components/narrowLayout';

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

describe('NarrowLayout', function () {
  beforeAll(function () {
    jest.spyOn(window.location, 'assign').mockImplementation(() => {});
  });
  afterAll(function () {
    window.location.assign.mockRestore();
  });

  it('renders without logout', function () {
    renderWithTheme(<NarrowLayout />);
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('renders with logout', function () {
    renderWithTheme(<NarrowLayout showLogout />);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('can logout', async function () {
    const mock = MockApiClient.addMockResponse({
      url: '/auth/',
      method: 'DELETE',
      status: 204,
    });
    renderWithTheme(<NarrowLayout showLogout />);

    await userEvent.click(screen.getByText('Sign out'));
    expect(mock).toHaveBeenCalled();
  });
});

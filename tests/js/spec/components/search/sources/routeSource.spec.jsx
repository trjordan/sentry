import React from 'react';

import {initializeOrg} from 'sentry-test/initializeOrg';
import {renderWithTheme, tick} from 'sentry-test/reactTestingLibrary';

import {RouteSource} from 'app/components/search/sources/routeSource';

describe('RouteSource', function () {
  it('can find a route', async function () {
    const mock = jest.fn().mockReturnValue(null);

    const {organization, project} = initializeOrg();
    renderWithTheme(
      <RouteSource query="password" {...{organization, project}}>
        {mock}
      </RouteSource>
    );

    await tick();
    const calls = mock.mock.calls;
    expect(calls[calls.length - 1][0].results[0].item).toEqual({
      description: 'Change your account password and/or two factor authentication',
      path: '/settings/account/security/',
      resultType: 'route',
      sourceType: 'route',
      title: 'Security',
      to: '/settings/account/security/',
    });
  });

  it('does not find any form field ', async function () {
    const mock = jest.fn().mockReturnValue(null);
    const {organization, project} = initializeOrg();
    renderWithTheme(
      <RouteSource query="invalid" {...{organization, project}}>
        {mock}
      </RouteSource>
    );

    await tick();
    expect(mock).toHaveBeenCalledWith(
      expect.objectContaining({
        results: [],
      })
    );
  });
});

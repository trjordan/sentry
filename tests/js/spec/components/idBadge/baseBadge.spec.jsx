import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import BaseBadge from 'app/components/idBadge/baseBadge';

describe('BadgeBadge', function () {
  it('has a display name', function () {
    const {container} = renderWithTheme(
      <BaseBadge
        organization={TestStubs.Organization()}
        displayName={<span id="test">display name</span>}
      />
    );
    const testElement = container.querySelector('#test');
    expect(testElement).toBeInTheDocument();
    expect(testElement).toHaveTextContent('display name');
  });

  it('can hide avatar', function () {
    const {container} = renderWithTheme(
      <BaseBadge organization={TestStubs.Organization()} hideAvatar />
    );
    const avatar = container.querySelector('.avatar');
    expect(avatar).not.toBeInTheDocument();
  });

  it('can hide name', function () {
    const {container} = renderWithTheme(
      <BaseBadge
        organization={TestStubs.Organization()}
        hideName
        displayName={<span id="test">display name</span>}
      />
    );
    const testElement = container.querySelector('#test');
    expect(testElement).not.toBeInTheDocument();
  });
});

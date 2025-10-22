import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import PlatformList from 'app/components/platformList';

describe('PlatformList', function () {
  const platforms = ['java', 'php', 'javascript', 'cocoa', 'ruby'];

  it('renders max of three icons from platforms', function () {
    const {container} = renderWithTheme(<PlatformList platforms={platforms} />);
    const icons = container.querySelectorAll('img');
    expect(icons).toHaveLength(3);
  });

  it('renders default if no platforms', function () {
    const {container} = renderWithTheme(<PlatformList platforms={[]} />);
    const icons = container.querySelectorAll('img');
    expect(icons).toHaveLength(1);
  });

  it('displays counter', function () {
    const {container} = renderWithTheme(
      <PlatformList platforms={platforms} showCounter />
    );
    const icons = container.querySelectorAll('img');
    expect(icons).toHaveLength(3);
    // Counter is a styled div with position: absolute in its styles
    const counter = container.querySelector('div[class*="Counter"]');
    expect(counter).toHaveTextContent('2+');
  });

  it('displays counter according to the max value', function () {
    const max = 2;
    const {container} = renderWithTheme(
      <PlatformList platforms={platforms} max={max} showCounter />
    );
    const icons = container.querySelectorAll('img');
    expect(icons).toHaveLength(max);
    // Counter is a styled div with position: absolute in its styles
    const counter = container.querySelector('div[class*="Counter"]');
    expect(counter).toHaveTextContent(`${platforms.length - max}+`);
  });
});

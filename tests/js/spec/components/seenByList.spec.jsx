import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import SeenByList from 'app/components/seenByList';
import ConfigStore from 'app/stores/configStore';

describe('SeenByList', function () {
  beforeEach(function () {
    jest.spyOn(ConfigStore, 'get').mockImplementation(() => ({}));
  });

  afterEach(function () {});

  it('should return null if seenBy is falsy', function () {
    const {container} = renderWithTheme(<SeenByList />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should return a list of each user that saw', function () {
    const {container} = renderWithTheme(
      <SeenByList
        seenBy={[
          {id: '1', email: 'jane@example.com'},
          {id: '2', email: 'john@example.com'},
        ]}
      />
    );

    expect(container.querySelectorAll('.avatar')).toHaveLength(2);
  });

  it('filters out the current user from list of users', function () {
    jest
      .spyOn(ConfigStore, 'get')
      .mockImplementation(() => ({id: '1', email: 'jane@example.com'}));

    const {container} = renderWithTheme(
      <SeenByList
        seenBy={[
          {id: '1', email: 'jane@example.com'},
          {id: '2', email: 'john@example.com'},
        ]}
      />
    );

    expect(container.querySelectorAll('.avatar')).toHaveLength(1);

    // Check the displayed user is john by looking at the avatar's title attribute
    const avatar = container.querySelector('.avatar');
    expect(avatar).toHaveAttribute('title', 'john@example.com');
  });
});

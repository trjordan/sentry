import React from 'react';

import {renderWithTheme, screen} from 'sentry-test/reactTestingLibrary';

import Hook from 'app/components/hook';
import HookStore from 'app/stores/hookStore';

describe('Hook', function () {
  const Wrapper = function Wrapper(props) {
    return <div data-test-id="wrapper" {...props} />;
  };
  const {context} = TestStubs.routerContext();

  beforeEach(function () {
    HookStore.add('footer', ({organization} = {}) => (
      <Wrapper key="initial" organization={organization}>
        {organization.slug}
      </Wrapper>
    ));
  });

  afterEach(function () {
    // Clear HookStore
    HookStore.init();
  });

  it('renders component from a hook', function () {
    renderWithTheme(
      <div>
        <Hook name="footer" organization={TestStubs.Organization()} />
      </div>,
      {context}
    );

    expect(HookStore.hooks.footer).toHaveLength(1);
    expect(screen.getByTestId('wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('wrapper')).toHaveTextContent('org-slug');
  });

  it('renders an invalid hook', function () {
    renderWithTheme(
      <div>
        <Hook name="invalid-hook" organization={TestStubs.Organization()} />
      </div>,
      {context}
    );

    expect(screen.queryByTestId('wrapper')).not.toBeInTheDocument();
  });

  it('can re-render when hooks get after initial render', function () {
    renderWithTheme(
      <div>
        <Hook name="footer" organization={TestStubs.Organization()} />
      </div>,
      {context}
    );

    expect(screen.getByTestId('wrapper')).toBeInTheDocument();

    HookStore.add('footer', ({organization} = {}) => (
      <Wrapper key="new" organization={organization}>
        New Hook
      </Wrapper>
    ));

    expect(HookStore.hooks.footer).toHaveLength(2);
    expect(screen.getAllByTestId('wrapper')).toHaveLength(2);
    expect(screen.getAllByTestId('wrapper')[1]).toHaveTextContent('New Hook');
  });

  it('can use children as a render prop', function () {
    renderWithTheme(
      <div>
        <Hook name="footer" organization={TestStubs.Organization()}>
          {({hooks}) => hooks.map((hook, i) => <Wrapper key={i}>{hook}</Wrapper>)}
        </Hook>
      </div>,
      {context}
    );

    HookStore.add('footer', ({organization} = {}) => (
      <Wrapper key="new" organization={organization}>
        New Hook
      </Wrapper>
    ));

    // Has 2 Wrappers from store, and each is wrapped by another Wrapper
    expect(screen.getAllByTestId('wrapper')).toHaveLength(4);
  });
});

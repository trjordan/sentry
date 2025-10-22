import React from 'react';

import {render, screen} from 'sentry-test/reactTestingLibrary';

import LoadingContainer from 'app/components/loading/loadingContainer';

describe('LoadingContainer', function () {
  it('handles normal state', () => {
    render(
      <LoadingContainer>
        <div>hello!</div>
      </LoadingContainer>
    );
    expect(screen.getByText('hello!')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('handles loading state', () => {
    const {rerender} = render(
      <LoadingContainer isLoading>
        <div>hello!</div>
      </LoadingContainer>
    );
    expect(screen.getByText('hello!')).toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    rerender(<LoadingContainer isLoading>{null}</LoadingContainer>);
    expect(screen.queryByText('hello!')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('handles reloading state', () => {
    const {rerender} = render(
      <LoadingContainer isReloading>
        <div>hello!</div>
      </LoadingContainer>
    );
    expect(screen.getByText('hello!')).toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();

    rerender(<LoadingContainer isReloading>{null}</LoadingContainer>);
    expect(screen.queryByText('hello!')).not.toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});

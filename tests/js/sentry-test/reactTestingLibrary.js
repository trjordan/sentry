import React from 'react';
import PropTypes from 'prop-types';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import {render} from '@testing-library/react'; // eslint-disable-line no-restricted-imports
import '@testing-library/jest-dom'; // eslint-disable-line no-restricted-imports

import {lightTheme} from 'app/utils/theme';

/**
 * Creates a wrapper component that provides both Emotion theme context
 * and legacy React context (for components using withOrganization, etc.)
 */
function createWrapper(options = {}) {
  const {context: contextOption} = options;
  
  // Extract context and childContextTypes from routerContext format
  const legacyContext = contextOption?.context || {};
  const childContextTypes = contextOption?.childContextTypes || {};

  class LegacyContextProvider extends React.Component {
    static childContextTypes = {
      organization: PropTypes.object,
      project: PropTypes.object,
      router: PropTypes.object,
      location: PropTypes.object,
      ...childContextTypes,
    };

    getChildContext() {
      return legacyContext;
    }

    render() {
      return this.props.children;
    }
  }

  return function AllTheProviders({children}) {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider theme={lightTheme}>
          <LegacyContextProvider>{children}</LegacyContextProvider>
        </ThemeProvider>
      </CacheProvider>
    );
  };
}

function renderWithProviders(ui, options = {}) {
  const {context, ...restOptions} = options;
  const wrapper = createWrapper({context});
  return render(ui, {wrapper, ...restOptions});
}

// re-export everything
export * from '@testing-library/react';
// override render with our custom wrapper
export {renderWithProviders as render};

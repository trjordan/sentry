import React from 'react';
import {render} from '@testing-library/react';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';

import {lightTheme} from 'app/utils/theme';

const renderWithTheme = (component, opts = {}) => {
  const WrappingThemeProvider = props => (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{props.children}</ThemeProvider>
    </CacheProvider>
  );

  return render(component, {wrapper: WrappingThemeProvider, ...opts});
};

export {renderWithTheme};

import React from 'react';
import {render} from '@testing-library/react';
import {CacheProvider} from '@emotion/react';
import {ThemeProvider} from '@emotion/react';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla

import {lightTheme} from 'app/utils/theme';

const renderWithTheme = (ui, options = {}) => {
  const WrappingThemeProvider = ({children}) => (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );

  return render(ui, {wrapper: WrappingThemeProvider, ...options});
};

export {renderWithTheme};

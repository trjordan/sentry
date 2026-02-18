import React from 'react';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';
import {render, screen} from '@testing-library/react';

import {lightTheme} from 'app/utils/theme';

const renderWithTheme = (ui, opts) => {
  const WrappingThemeProvider = ({children}) => (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );

  return render(ui, {wrapper: WrappingThemeProvider, ...opts});
};

export {renderWithTheme, screen};

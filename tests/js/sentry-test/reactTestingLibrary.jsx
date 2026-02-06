import {render as rtlRender} from '@testing-library/react';
import {cache} from '@emotion/css'; // eslint-disable-line emotion/no-vanilla
import {CacheProvider, ThemeProvider} from '@emotion/react';

import {lightTheme} from 'app/utils/theme';

function render(ui, {context, ...options} = {}) {
  const Wrapper = ({children}) => (
    <CacheProvider value={cache}>
      <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
    </CacheProvider>
  );

  return rtlRender(ui, {wrapper: Wrapper, ...options});
}

export * from '@testing-library/react';
export {render};

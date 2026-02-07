import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import GlobalModal from 'app/components/globalModal';

export async function mountGlobalModal(context) {
  const result = renderWithTheme(<GlobalModal />, context);
  await tick();

  return result;
}

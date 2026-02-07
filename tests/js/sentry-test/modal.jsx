import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import GlobalModal from 'app/components/globalModal';

export async function mountGlobalModal(context) {
  const modal = renderWithTheme(<GlobalModal />, context);
  await tick();

  return modal;
}

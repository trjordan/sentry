import React from 'react';

import {
  changeReactMentionsInput,
  fireEvent,
  renderWithTheme,
  screen,
} from 'sentry-test/reactTestingLibrary';

import NoteInputWithStorage from 'app/components/activity/note/inputWithStorage';
import localStorage from 'app/utils/localStorage';

jest.mock('app/utils/localStorage');

describe('NoteInputWithStorage', function () {
  const defaultProps = {
    storageKey: 'storage',
    itemKey: 'item1',
    group: {project: {}, id: 'groupId'},
    memberList: [],
    teams: [],
  };

  beforeEach(function () {
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.getItem.mockReturnValue(null);
  });

  it('loads draft item from local storage when mounting', function () {
    localStorage.getItem.mockImplementation(() => JSON.stringify({item1: 'saved item'}));

    renderWithTheme(<NoteInputWithStorage {...defaultProps} />);

    expect(localStorage.getItem).toHaveBeenCalledWith('storage');
    expect(screen.getByRole('textbox')).toHaveValue('saved item');
  });

  it('saves draft when input changes', function () {
    jest.useFakeTimers();
    renderWithTheme(<NoteInputWithStorage {...defaultProps} />);

    changeReactMentionsInput('WIP COMMENT');

    // Advance timers to trigger the debounced save (150ms debounce)
    jest.advanceTimersByTime(150);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'storage',
      JSON.stringify({item1: 'WIP COMMENT'})
    );

    jest.useRealTimers();
  });

  it('removes draft item after submitting', function () {
    localStorage.getItem.mockImplementation(() =>
      JSON.stringify({item1: 'draft item', item2: 'item2', item3: 'item3'})
    );

    renderWithTheme(<NoteInputWithStorage {...defaultProps} />);

    changeReactMentionsInput('new comment');

    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'Enter', ctrlKey: true});
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'storage',
      JSON.stringify({item2: 'item2', item3: 'item3'})
    );
  });
});

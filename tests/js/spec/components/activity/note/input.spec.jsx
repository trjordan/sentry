import React from 'react';

import {
  changeReactMentionsInput,
  fireEvent,
  renderWithTheme,
  screen,
} from 'sentry-test/reactTestingLibrary';

import NoteInput from 'app/components/activity/note/input';

describe('NoteInput', function () {
  describe('New item', function () {
    const props = {
      group: {project: {}, id: 'groupId'},
      projectSlugs: [],
    };

    it('renders', function () {
      renderWithTheme(<NoteInput {...props} />);
    });

    it('submits when meta + enter is pressed', function () {
      const onCreate = jest.fn();
      renderWithTheme(<NoteInput {...props} onCreate={onCreate} />);

      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, {key: 'Enter', metaKey: true});
      expect(onCreate).toHaveBeenCalled();
    });

    it('submits when ctrl + enter is pressed', function () {
      const onCreate = jest.fn();
      renderWithTheme(<NoteInput {...props} onCreate={onCreate} />);

      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});
      expect(onCreate).toHaveBeenCalled();
    });

    it('handles errors', async function () {
      const errorJSON = {detail: {message: '', code: 401, extra: ''}};
      renderWithTheme(<NoteInput {...props} error={!!errorJSON} errorJSON={errorJSON} />);

      const input = screen.getByRole('textbox');

      fireEvent.keyDown(input, {key: 'Enter', ctrlKey: true});
      expect(screen.getByText('Unable to post comment')).toBeInTheDocument();
    });
  });

  describe('Existing Item', function () {
    const defaultProps = {
      group: {project: {}, id: 'groupId'},
      modelId: 'item-id',
      text: 'an existing item',
      projectSlugs: [],
    };

    it('edits existing message', async function () {
      renderWithTheme(<NoteInput {...defaultProps} />);

      expect(screen.getByText('Edit')).toBeInTheDocument();

      // Switch to preview
      fireEvent.click(screen.getByText('Preview'));

      // The preview area should show the text (checking it exists somewhere)
      expect(screen.getAllByText('an existing item').length).toBeGreaterThan(0);

      // Switch to edit
      fireEvent.click(screen.getByText('Edit'));

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('an existing item');
    });

    it('canels editing and moves to preview mode', async function () {
      const onEditFinish = jest.fn();
      renderWithTheme(<NoteInput {...defaultProps} onEditFinish={onEditFinish} />);

      changeReactMentionsInput('new value');

      expect(screen.getByText('Cancel')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Cancel'));

      expect(onEditFinish).toHaveBeenCalled();
    });
  });
});

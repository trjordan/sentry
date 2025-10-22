import React from 'react';

import {mountWithTheme} from 'sentry-test/enzyme';
import {selectByValue} from 'sentry-test/select-new';

import {RenderField} from 'app/views/settings/components/forms/projectMapperField';

describe('ProjectMapperField', () => {
  const mappedDropdown = {
    placholder: 'hi',
    items: [
      {value: '1', label: 'label 1'},
      {value: '2', label: 'label 2'},
      {value: '3', label: 'label 3'},
    ],
  };

  const sentryProjects = [
    {id: '23', slug: 'cool', platform: 'javascript', name: 'Cool'},
    {id: '24', slug: 'beans', platform: 'python', name: 'Beans'},
  ];
  let onBlur, onChange, props, existingValues;

  beforeEach(() => {
    existingValues = [['23', '2']];
    onBlur = jest.fn();
    onChange = jest.fn();
    props = {
      mappedDropdown,
      sentryProjects,
      nextButton: {
        url: 'https://vercel.com/dashboard/integrations/icfg_fuqLnwH3IYmcpAKAWY8eoYlR',
        next: 'Return to Vercel',
      },
      value: existingValues,
      onChange,
      onBlur,
    };
  });

  it('clicking add updates values with current dropdown values', () => {
    const wrapper = mountWithTheme(<RenderField {...props} />);
    selectByValue(wrapper, '24', {name: 'project', control: true});
    selectByValue(wrapper, '1', {name: 'mappedDropdown', control: true});

    wrapper.find('Button[icon]').at(1).simulate('click');

    expect(onBlur).toHaveBeenCalledWith(
      [
        ['23', '2'],
        ['24', '1'],
      ],
      []
    );
    expect(onChange).toHaveBeenCalledWith(
      [
        ['23', '2'],
        ['24', '1'],
      ],
      []
    );
  });

  it('can delete item', () => {
    existingValues = [
      ['23', '2'],
      ['24', '1'],
    ];
    const wrapper = mountWithTheme(<RenderField {...props} value={existingValues} />);
    wrapper.find('Button[icon]').at(0).simulate('click');

    expect(onBlur).toHaveBeenCalledWith([['24', '1']], []);
    expect(onChange).toHaveBeenCalledWith([['24', '1']], []);
  });

  it('handles deleted items without error', () => {});
});

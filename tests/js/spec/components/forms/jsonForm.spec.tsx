import React from 'react';

import {renderWithTheme} from 'sentry-test/reactTestingLibrary';

import accountDetailsFields from 'app/data/forms/accountDetails';
import {fields} from 'app/data/forms/projectGeneralSettings';
import JsonForm from 'app/views/settings/components/forms/jsonForm';

// @ts-expect-error
const user = TestStubs.User({});

describe('JsonForm', function () {
  describe('form prop', function () {
    it('default', function () {
      const {container} = renderWithTheme(
        <JsonForm forms={accountDetailsFields} additionalFieldProps={{user}} />
      );
      // Basic structure check instead of snapshot
      expect(container.querySelector('[id="Account-Details"]')).not.toBe(null);
      expect(container.querySelector('input[name="name"]')).not.toBe(null);
    });

    it('missing additionalFieldProps required in "valid" prop', function () {
      // eslint-disable-next-line no-console
      console.error = jest.fn();
      try {
        renderWithTheme(<JsonForm forms={accountDetailsFields} />);
      } catch (error) {
        expect(error.message).toBe(
          "Cannot read properties of undefined (reading 'email')"
        );
      }
    });

    it('should ALWAYS hide panel, if all fields have visible set to false  AND there is no renderHeader & renderFooter -  visible prop is of type boolean', function () {
      const modifiedAccountDetails = accountDetailsFields.map(accountDetailsField => ({
        ...accountDetailsField,
        fields: accountDetailsField.fields.map(field => ({...field, visible: false})),
      }));

      const {container} = renderWithTheme(
        <JsonForm forms={modifiedAccountDetails} additionalFieldProps={{user}} />
      );

      // Panel component is a styled div - can't use data-test-id, so use structure check instead
      expect(container.querySelector('[id="Account-Details"]')).toBe(null);
    });

    it('should ALWAYS hide panel, if all fields have visible set to false AND there is no renderHeader & renderFooter -  visible prop is of type func', function () {
      const modifiedAccountDetails = accountDetailsFields.map(accountDetailsField => ({
        ...accountDetailsField,
        fields: accountDetailsField.fields.map(field => ({
          ...field,
          visible: () => false,
        })),
      }));

      const {container} = renderWithTheme(
        <JsonForm forms={modifiedAccountDetails} additionalFieldProps={{user}} />
      );

      expect(container.querySelector('[id="Account-Details"]')).toBe(null);
    });

    it('should NOT hide panel, if at least one field has visible set to true -  no visible prop (1 field) + visible prop is of type func (2 field)', function () {
      // accountDetailsFields has two fields. The second field will always have visible set to false, because the username and the email are the same 'foo@example.com'
      const {container} = renderWithTheme(
        <JsonForm forms={accountDetailsFields} additionalFieldProps={{user}} />
      );

      expect(container.querySelector('[id="Account-Details"]')).not.toBe(null);
      expect(container.querySelectorAll('input')).toHaveLength(1);
    });

    it('should NOT hide panel, if all fields have visible set to false AND a prop renderHeader is passed', function () {
      const modifiedAccountDetails = accountDetailsFields.map(accountDetailsField => ({
        ...accountDetailsField,
        fields: accountDetailsField.fields.map(field => ({...field, visible: false})),
      }));

      const {container} = renderWithTheme(
        <JsonForm
          forms={modifiedAccountDetails}
          additionalFieldProps={{user}}
          renderHeader={() => <div>this is a Header </div>}
        />
      );

      expect(container.querySelector('[id="Account-Details"]')).not.toBe(null);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });

    it('should NOT hide panel, if all fields have visible set to false AND a prop renderFooter is passed', function () {
      const modifiedAccountDetails = accountDetailsFields.map(accountDetailsField => ({
        ...accountDetailsField,
        fields: accountDetailsField.fields.map(field => ({...field, visible: false})),
      }));

      const {container} = renderWithTheme(
        <JsonForm
          forms={modifiedAccountDetails}
          additionalFieldProps={{user}}
          renderFooter={() => <div>this is a Footer </div>}
        />
      );

      expect(container.querySelector('[id="Account-Details"]')).not.toBe(null);
      expect(container.querySelectorAll('input')).toHaveLength(0);
    });
  });

  describe('fields prop', function () {
    const jsonFormFields = [fields.slug, fields.platform];

    it('default', function () {
      const {container} = renderWithTheme(<JsonForm fields={jsonFormFields} />);
      // Basic structure check instead of snapshot
      expect(container.querySelector('[class*="PanelBody"]')).not.toBe(null);
      expect(container.querySelector('input[name="slug"]')).not.toBe(null);
      expect(container.querySelector('input[name="platform"]')).not.toBe(null);
    });

    it('missing additionalFieldProps required in "valid" prop', function () {
      // eslint-disable-next-line no-console
      console.error = jest.fn();
      try {
        renderWithTheme(
          <JsonForm
            fields={[{...jsonFormFields[0], visible: ({test}) => !!test.email}]}
          />
        );
      } catch (error) {
        expect(error.message).toBe(
          "Cannot read properties of undefined (reading 'email')"
        );
      }
    });

    it('should NOT hide panel, if at least one field has visible set to true - no visible prop', function () {
      // slug and platform have no visible prop, that means they will be always visible
      const {container} = renderWithTheme(<JsonForm fields={jsonFormFields} />);
      // Panel is rendered - check via PanelBody
      expect(container.querySelector('[class*="PanelBody"]')).not.toBe(null);
      // slug field is text input, platform is select (hidden input + styled component)
      expect(container.querySelector('input[name="slug"]')).not.toBe(null);
      expect(container.querySelector('input[name="platform"]')).not.toBe(null);
    });

    it('should NOT hide panel, if at least one field has visible set to true -  visible prop is of type boolean', function () {
      // slug and platform have no visible prop, that means they will be always visible
      const {container} = renderWithTheme(
        <JsonForm fields={jsonFormFields.map(field => ({...field, visible: true}))} />
      );
      expect(container.querySelector('[class*="PanelBody"]')).not.toBe(null);
      expect(container.querySelector('input[name="slug"]')).not.toBe(null);
      expect(container.querySelector('input[name="platform"]')).not.toBe(null);
    });

    it('should NOT hide panel, if at least one field has visible set to true -  visible prop is of type func', function () {
      // slug and platform have no visible prop, that means they will be always visible
      const {container} = renderWithTheme(
        <JsonForm
          fields={jsonFormFields.map(field => ({...field, visible: () => true}))}
        />
      );
      expect(container.querySelector('[class*="PanelBody"]')).not.toBe(null);
      expect(container.querySelector('input[name="slug"]')).not.toBe(null);
      expect(container.querySelector('input[name="platform"]')).not.toBe(null);
    });

    it('should ALWAYS hide panel, if all fields have visible set to false -  visible prop is of type boolean', function () {
      // slug and platform have no visible prop, that means they will be always visible
      const {container} = renderWithTheme(
        <JsonForm fields={jsonFormFields.map(field => ({...field, visible: false}))} />
      );
      // No panel should be rendered
      expect(container.querySelector('[class*="PanelBody"]')).toBe(null);
    });

    it('should ALWAYS hide panel, if all fields have visible set to false - visible prop is of type function', function () {
      // slug and platform have no visible prop, that means they will be always visible
      const {container} = renderWithTheme(
        <JsonForm
          fields={jsonFormFields.map(field => ({...field, visible: () => false}))}
        />
      );
      expect(container.querySelector('[class*="PanelBody"]')).toBe(null);
    });
  });
});

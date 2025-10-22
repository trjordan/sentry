import React from 'react';
import styled from '@emotion/styled';

type HighlightProps = {
  /**
   * The text to highlight
   */
  text: string;
  /**
   * Should highlighting be disabled?
   */
  disabled?: boolean;
  /**
   * The original text
   */
  children: string;
};

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, keyof HighlightProps> &
  HighlightProps;

const HighlightComponent = ({className, children, disabled, text, ...props}: Props) => {
  // There are instances when children is not string in breadcrumbs but not caught by TS
  if (!text || disabled || typeof children !== 'string') {
    return <span {...props}>{children}</span>;
  }

  const highlightText = text.toLowerCase();
  const idx = children.toLowerCase().indexOf(highlightText);

  if (idx === -1) {
    return <span {...props}>{children}</span>;
  }

  return (
    <span {...props}>
      {children.substr(0, idx)}
      <span className={className}>{children.substr(idx, highlightText.length)}</span>
      {children.substr(idx + highlightText.length)}
    </span>
  );
};

const Highlight = styled(HighlightComponent)`
  font-weight: normal;
  background-color: ${p => p.theme.yellow200};
  color: ${p => p.theme.textColor};
`;

export default Highlight;
export {HighlightComponent};

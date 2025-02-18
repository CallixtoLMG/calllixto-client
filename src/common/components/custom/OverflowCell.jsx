import { useRef, useState } from "react";
import { Popup } from "semantic-ui-react";
import styled from "styled-components";

const CellText = styled.p`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin: 0;
  max-width: ${({ maxWidth }) => maxWidth || "30vw"};
`;

export const OverflowCell = ({ text, maxWidth }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const handleMouseEnter = () => {
    if (textRef.current) {
      const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
      setIsTruncated(isOverflowing);
    }
  };

  return (
    <Popup
      size="tiny"
      disabled={!isTruncated}
      content={text}
      position="top center"
      trigger={
        <CellText maxWidth={maxWidth} ref={textRef} onMouseEnter={handleMouseEnter}>
          {text}
        </CellText>
      }
    />
  );
};
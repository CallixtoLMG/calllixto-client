import { useEffect, useRef, useState } from "react";
import { Popup } from "semantic-ui-react";
import styled, { css } from "styled-components";

const OverflowText = styled.div`
  display: inline-block;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};

  ${({ $lineClamp }) =>
    $lineClamp > 1
      ? css`
          display: -webkit-box;
          -webkit-line-clamp: ${$lineClamp};
          -webkit-box-orient: vertical;
          overflow: hidden;
        `
      : css`
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `}
`;

const OverflowWrapper = ({
  children,
  popupContent,
  position = "top center",
  maxWidth = "100%",
  lineClamp = 1,
}) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const detectOverflow = () => {
    const el = textRef.current;
    if (!el) return;

    if (lineClamp > 1) {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const maxAllowedHeight = lineHeight * lineClamp;
      setIsTruncated(el.scrollHeight > maxAllowedHeight);
    } else {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  };

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(detectOverflow);
    const timeout = setTimeout(detectOverflow, 500);
    const resizeObserver = new ResizeObserver(detectOverflow);
    resizeObserver.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      resizeObserver.disconnect();
    };
  }, [children, popupContent, lineClamp]);

  return (
    <Popup
      content={popupContent}
      position={position}
      disabled={!isTruncated}
      trigger={
        <OverflowText
          ref={textRef}
          $maxWidth={maxWidth}
          $lineClamp={lineClamp}
        >
          {children}
        </OverflowText>
      }
    />
  );
};

export default OverflowWrapper;

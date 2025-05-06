import { useCallback, useEffect, useRef, useState } from "react";
import { Popup } from "semantic-ui-react";
import styled, { css } from "styled-components";

const OverflowText = styled.div`
  display: inline-block;
  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth};
  height: ${({ $height }) => $height}!important;

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
          vertical-align: ${({ $verticalAlign = "middle" }) => $verticalAlign};
        `}
`;

export const OverflowWrapper = ({
  children,
  popupContent,
  position = "top center",
  maxWidth = "100%",
  $lineClamp = 1,
  height,
  $verticalAlign
}) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const detectOverflow = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    if ($lineClamp > 1) {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const maxAllowedHeight = lineHeight * $lineClamp;
      setIsTruncated(el.scrollHeight > maxAllowedHeight);
    } else {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [$lineClamp]);

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
  }, [children, popupContent, $lineClamp, detectOverflow]);

  return (
    <Popup
      content={popupContent}
      position={position}
      disabled={!isTruncated}
      trigger={
        <OverflowText
          ref={textRef}
          $maxWidth={maxWidth}
          $lineClamp={$lineClamp}
          $height={height}
          $verticalAlign={$verticalAlign}
        >
          {children}
        </OverflowText>
      }
    />
  );
};


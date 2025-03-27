// hooks/useTruncationPopupRenderer.tsx
import { useEffect, useRef, useState } from "react";
import { Popup } from "semantic-ui-react";

export const useTruncationPopupRenderer = ({ maxWidth = "150px", position = "top center" } = {}) => {
  const renderWithTruncation = (text, styleOverride = {}) => {
    const ref = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
      const el = ref.current;
      if (el) {
        setIsTruncated(el.scrollWidth > el.clientWidth);
      }
    }, [text]);

    const textEl = (
      <div
        ref={ref}
        style={{
          maxWidth,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          ...styleOverride
        }}
      >
        {text}
      </div>
    );

    return (
      <Popup
        content={text}
        position={position}
        disabled={!isTruncated}
        trigger={textEl}
      />
    );
  };

  return renderWithTruncation;
};

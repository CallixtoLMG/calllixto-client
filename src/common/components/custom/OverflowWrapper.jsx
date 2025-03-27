import { useEffect, useRef, useState } from "react";
import { Popup } from "semantic-ui-react";

const OverflowWrapper = ({
  children,
  popupContent,
  position = "top center",
  maxWidth = "100%",
  style = {},
}) => {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
  }, [children, popupContent]);

  return (
    <Popup
      content={popupContent}
      position={position}
      disabled={!isTruncated}
      trigger={
        <div ref={wrapperRef} style={{
          display: 'inline-block', maxWidth, height: "100%", width: "100%", alignContent: "center", ...style
        }}>
          <div
            ref={textRef}
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {children}
          </div>
        </div >
      }
    />
  );
};

export default OverflowWrapper;

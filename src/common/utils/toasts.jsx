import toast from "react-hot-toast";

const WarningToastIcon = () => (
  <span
    style={{
      alignItems: "center",
      aspectRatio: "1 / 1",
      background: "#f2711c",
      borderRadius: "50%",
      color: "#fff",
      display: "inline-flex",
      flexShrink: 0,
      fontSize: "14px",
      fontWeight: 700,
      height: "20px",
      justifyContent: "center",
      lineHeight: 1,
      minWidth: "20px",
      width: "20px",
    }}
  >
    !
  </span>
);

const WARNING_TOAST_OPTIONS = {
  icon: <WarningToastIcon />,
  style: {
    background: "#fff8e6",
    border: "1px solid #f2c037",
    color: "rgba(0, 0, 0, 0.87)",
  },
};

export const showWarningToast = (message, options = {}) => {
  return toast(message, {
    ...WARNING_TOAST_OPTIONS,
    ...options,
    style: {
      ...WARNING_TOAST_OPTIONS.style,
      ...options.style,
    },
  });
};

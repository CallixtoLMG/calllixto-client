import { AccordionTitle, Icon } from "@/common/components/custom";
import { ICONS } from "@/common/constants";
import SettingsInfoIcon from "./SettingsInfoIcon";

const SettingsAccordionTitle = ({ active, children, helpText, onClick }) => (
  <AccordionTitle $active={active} onClick={onClick}>
    <Icon $height="20px" name={ICONS.CARET_UP} />
    <span>{children}</span>
    <SettingsInfoIcon content={helpText} />
  </AccordionTitle>
);

export default SettingsAccordionTitle;

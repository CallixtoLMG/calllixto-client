import { Flex } from "@/common/components/custom";
import SettingsInfoIcon from "./SettingsInfoIcon";
import { Span } from "./styles";

const SettingsFieldLabel = ({ children, helpText }) => (
  <Flex $marginBottom="4px" as="span" $alignItems="center" $columnGap="0">
    <Span>{children}</Span>
    <SettingsInfoIcon content={helpText} />
  </Flex>
);

export default SettingsFieldLabel;

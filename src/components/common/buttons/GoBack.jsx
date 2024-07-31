import { SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { Icon } from 'semantic-ui-react';
import { IconedButton } from "../custom";

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS.BACKSPACE)

  return (
    <IconedButton
      size="small"
      icon
      labelPosition="left"
      width="fit-content"
      color="grey"
      onClick={handleClick}
      type="button"
    >
      <Icon name="arrow left" />
      Atrás
    </IconedButton>
  );
};

export default GoBack;

import { SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { Icon } from 'semantic-ui-react';
import { Button } from "../custom";

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS.BACKSPACE)

  return (
    <Button
      width="fit-content"
      size="small"
      icon
      labelPosition="left"
      color="grey"
      onClick={handleClick}
      type="button"
    >
      <Icon name="arrow left" /> Atrás
    </Button>
  );
};

export default GoBack;

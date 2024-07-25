import { SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { Button, Icon } from 'semantic-ui-react';

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS.BACKSPACE)

  return (
    <Button
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

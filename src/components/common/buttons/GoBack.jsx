import { SHORTKEY } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { Button, ButtonContent, Icon } from 'semantic-ui-react';

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEY.BACKSPACE)
  
  return (
    <Button
      animated
      color="grey"
      onClick={handleClick}
      type="button"
    >
      <ButtonContent hidden>Atrás</ButtonContent>
      <ButtonContent visible>
        <Icon name="arrow left" />
      </ButtonContent>
    </Button>
  );
};

export default GoBack;

import { PAGES } from "@/constants";
import Link from "next/link";
import { Button } from "semantic-ui-react";

const ButtonEdit = ({ page, element }) => {
  return (
    <Link href={PAGES[page].UPDATE(element)}>
      <Button color='blue' content='Editar' size="tiny" />
    </Link>
  )
};

export default ButtonEdit;
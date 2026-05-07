import { EMAIL_TABLE_HEADERS } from "../form.constants";
import { ContactSectionView } from "./ContactSectionView";

export const EmailView = ({ emails = [] }) => (
  <ContactSectionView
    wrap
    headers={EMAIL_TABLE_HEADERS}
    elements={emails}
    mainKey={(email, index) => `${email.ref}-${email.email}-${index}`}
  />
);

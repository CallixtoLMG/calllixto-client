import EditForm from "@/components/EditForm"
import { Button, Popup } from 'semantic-ui-react'

const PopUpEdit = () => (
  <Popup
    trigger={<Button color='blue' size="tiny">Editar</Button>}
    content={<EditForm />}
    position='left center'
    on='click'
  />
)

export default PopUpEdit
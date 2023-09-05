import { Button, Form } from 'semantic-ui-react';

const EditForm = () => (
  <Form>
    <Form.Field>
      <label>Nombre Completo...</label>
      <input placeholder='First Name' />
    </Form.Field>
    <Form.Field>
      <label>Mail...</label>
      <input placeholder='Last Name' />
    </Form.Field>
    <Form.Field>
      <label>Telefono...</label>
      <input placeholder='Last Name' />
    </Form.Field>
    <Button type='submit'>Modificar</Button>
  </Form>
)

export default EditForm
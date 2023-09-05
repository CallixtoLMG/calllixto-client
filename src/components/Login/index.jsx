"use client"
import Image from 'next/image';
import Link from 'next/link';
import 'semantic-ui-css/semantic.min.css';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react';
import { Text } from "./styled";

const LoginForm = () => (
  <Grid textAlign='center' style={{ height: '100vh', backgroundColor: "#C8E3DF" }} verticalAlign='middle'>
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header as='h3' textAlign='center'>
        <div>
          <Image
            src="/Callixto.png"
            alt="Callixto.png Logo"
            width={300}
            height={100}
            priority
          />
          <Text style={{ color: "#579294" }}>Ingresa a tu cuenta</Text>
        </div>
      </Header>
      <Form size='large'>
        <Segment stacked>
          <Form.Input fluid icon='user' iconPosition='left' placeholder='Correo electrónico' />
          <Form.Input
            fluid
            icon='lock'
            iconPosition='left'
            placeholder='Contraseña'
            type='password'
          />
          <Link href={"/productos"}>
          <Button style={{ backgroundColor: "#579294", color: "white" }} fluid size='large'>
            Ingresar
          </Button>
          </Link>
        </Segment>
      </Form>
      <Message>
        Quieres conocer maduras calientes a 5km? <a href='#'> Haz click aqui</a>
      </Message>
    </Grid.Column>
  </Grid>
)

export default LoginForm
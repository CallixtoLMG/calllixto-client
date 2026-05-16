import awsConfig from '@/aws-config';
import { PATHS, URL } from '@/fetchUrls';
import { confirmResetPassword, confirmSignIn, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import axios from "axios";
import { setToken } from '@/services/session';

Amplify.configure(awsConfig);

const completeAuthenticatedSession = async () => {
  const session = await fetchAuthSession();
  const accessToken = session.tokens.accessToken.toString();
  setToken(accessToken);
};

export async function login({ username, password }) {
  try {
    const user = await signIn({
      username,
      password,
    });

    if (user.nextStep?.signInStep === 'DONE') {
      await completeAuthenticatedSession();
    }

    return user;
  } catch (error) {
    console.error('Error durante el ingreso:', error);
    throw error;
  }
}

export async function confirmNewPasswordRequired({ newPassword }) {
  try {
    const user = await confirmSignIn({
      challengeResponse: newPassword,
    });

    if (user.nextStep?.signInStep === 'DONE') {
      await completeAuthenticatedSession();
    }

    return user;
  } catch (error) {
    console.error('Error al confirmar nueva contrasena:', error);
    throw error;
  }
}

export async function recoverPassword(data) {
  const { data: response } = await axios.post(`${URL}${PATHS.RESTORE_PASSWORD}`, data);
  return response
};

export async function confirmReset({ username, confirmationCode, newPassword }) {
  try {
    await confirmResetPassword({
      username,
      confirmationCode,
      newPassword,
    });
  } catch (error) {
    console.error('Error al cambiar confirmar contraseña:', error);
    throw error;
  };
};

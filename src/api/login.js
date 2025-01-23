import awsConfig from '@/aws-config';
import { PATHS, URL } from '@/fetchUrls';
import { confirmResetPassword, confirmSignIn, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import axios from "axios";

Amplify.configure(awsConfig);

export async function login({ username, password, newPassword }) {
  try {
    const user = await signIn({
      username,
      password,
    });

    if (user.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
      await confirmSignIn({
        challengeResponse: newPassword,
      });
    }

    if (user.nextStep?.signInStep === 'DONE') {
      const session = await fetchAuthSession();
      const accessToken = session.tokens.accessToken.toString();
      localStorage.setItem('token', accessToken);
    }

  } catch (error) {
    console.error('Error durante el ingreso:', error);
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

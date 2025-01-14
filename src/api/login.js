import awsConfig from '@/aws-config';
import { confirmSignIn, fetchAuthSession, signIn } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';

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
    console.error('Error during ingreso:', error);
    throw error;
  }
}

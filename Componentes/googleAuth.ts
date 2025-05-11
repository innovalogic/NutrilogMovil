import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleSignIn = () => {
    // Obtén la redirectUri de Expo
  const redirectUri = AuthSession.makeRedirectUri();
  console.log('Redirect URI:', redirectUri);
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '84627290881-fv5g222272pfqqc55fuuu21okl1pivsl.apps.googleusercontent.com',
    androidClientId: '84627290881-v3coob9426arkkt8r0lkff3di94d8i3b.apps.googleusercontent.com',
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('Login con Google exitoso');
        })
        .catch((error) => {
          console.log('Error al iniciar con Google', error);
        });
    }
  }, [response]);

  return { promptAsync, request };
};

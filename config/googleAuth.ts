import { auth } from '@/config/firebase';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  // Use the ID token flow (best for Firebase signInWithCredential)
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri(),
    
   });


  async function signInWithGoogle() {
    
    const result = await promptAsync();

    if (result.type !== 'success') return;

    const { idToken } = result.authentication!;
    const credential = GoogleAuthProvider.credential(idToken);

    await signInWithCredential(auth, credential);
    
  }

  return {
    signInWithGoogle,
    disabled: !request,
  };
};


// export const signInWithGoogleCredential = async (idToken: string) => {
//     const credential = GoogleAuthProvider.credential(idToken);
//     return signInWithCredential(auth, credential);
// }

// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// import { auth } from './firebase';

// export const configureGoogleSignIn = () => {
//     GoogleSignin.configure({
//         webClientId: '941293890230-c7aftfv5a2piv53cclrrvqkdv8pf7pht.apps.googleusercontent.com',
//     });
// };

// export const signInWithGoogle = async () => {
//     await GoogleSignin.hasPlayServices();
//     const userInfo = await GoogleSignin.signIn();

//     const idToken = userInfo.data?.idToken;
//     if (!idToken) throw new Error('No ID token found');

//     const credential = GoogleAuthProvider.credential(idToken);
//     return signInWithCredential(auth, credential);
// };
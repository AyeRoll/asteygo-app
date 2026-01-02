import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useEffect, useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth, register } from "../../config/firebase";
WebBrowser.maybeCompleteAuthSession();

export default function SignUp() {
    const router = useRouter();
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState("");
    const[name, setName] = useState("");

    const [request, response, promptAsync ] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    redirectUri: makeRedirectUri(), 
  });

    useEffect(() => {
        console.log('[Google] response:', response);
        console.log('WEB CLIENT ID:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
        
        if (response?.type === 'success') {
            const idToken = response.authentication?.idToken;
            console.log('[Google] idToken exists:', !!idToken);
            if (!idToken) {
                setError('Google sign-in succeeded but no id_token was returned.');
                return;
            }
            const credential = GoogleAuthProvider.credential(idToken);
            console.log('[Firebase] Credential created');


            signInWithCredential(auth, credential).catch((err) => {
                setError(err.message);
            });
        }
        if (response?.type !== 'success') {
            console.log('[Google] Not successful yet:', response?.type);
            return;
        }

        console.log('[Google] OAuth success');
    }, [response]);

    // useEffect(() => {
    //     if (response?.type === 'success') {
    //         const idToken = response.authentication?.idToken;
    //         if (!idToken) {
    //             setError('Google sign-in succeeded but no id_token was returned.');
    //             return;
    //         }
    //         const credential = GoogleAuthProvider.credential(idToken);

    //         signInWithCredential(auth, credential).catch((err) => {
    //             setError(err.message);
    //         });
    //     }
    // }, [response]);


    const handleSignUp = async() => {
        setLoading(true);
        setError(""); 

        try {
            await register(email, password, name);
        } catch (err){
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
    if (!request) {
        console.log('[Google] Request not ready yet');
        return;
    }

    console.log('[Google] Starting OAuth flow');

    try {
        const result = await promptAsync();
        console.log('[Google] promptAsync result:', result);
    } catch (err) {
        console.error('[Google] promptAsync error:', err);
    }

    console.log('[Google] request ready:', !!request);
    };



    // const handleGoogleSignIn = async () => {
    //     setLoading(true);
    //     setError("");
    //     console.log('[Google] Button pressed');

    //     try {
    //         const result = await promptAsync();
    //         console.log('[Google] promptAsync result:', result);
    //     } catch (err) {
    //         console.error('[Google] promptAsync error:', err);
    //     }

    //     // try { 
    //     //     await promptAsync();
    //     //     // Successful sign-in will be handled by auth state listener
    //     // } catch (err) {
    //     //     const error = err as Error;
    //     //     setError(error.message);
    //     // } finally {
    //     //     setLoading(false);
    //     // }

    // };
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16}}>
        <Text style={{ justifyContent: 'center', padding: 16 }}>Sign Up</Text>


        <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            style={{ width: '100%', padding:12, borderWidth:1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12}}
            autoCapitalize="words"
        />        
        <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{ width: '100%', padding:12, borderWidth:1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12}}
            keyboardType="email-address"
            autoCapitalize="none"
        />
        <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={{ width:'100%', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12}}
            secureTextEntry
        />
        {error ? <Text style={{ color: 'red', marginBottom: 12}}>{error}</Text> : null}
        <Button title={loading ? "Signing Up..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />

        <View style={{ marginVertical: 16, width: '100%', alignItems:'center', }}>
            <Text style={{ color: '#666' }}>- OR -</Text>
        </View>

        <TouchableOpacity 
        onPress={handleGoogleSignIn} 
        disabled={!request || loading}
        style={{
            backgroundColor: '#4285F4',
            padding: 12,
            borderRadius: 8,
            width: '100%',
            alignItems: 'center',

         }}
         >
         <Text style={{ color:'white', fontWeight:'bold'}}>Sign In With Google</Text>  
         </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/signin")} style={{ marginTop: 16}}>
                <Text>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    )
}
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login } from "../../config/firebase";

export default function SignIn() {
    const router = useRouter();
    const[email, setEmail] = useState("");
    const[password, setPassword] = useState("");
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState("");

    const handleLogin= async() => {
        setLoading(true);
        setError("");

        try {
            await login(email, password);
        } catch (err){
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
            <Text style={{ justifyContent: 'center', padding: 16 }}>Sign In</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={{ width: '100%', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 }}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={{ width: '100%', padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 }}
                secureTextEntry
            />
            {error ? <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text> : null}
            <Button title={loading ? "Signing In..." : "Sign In"} onPress={handleLogin} disabled={loading} />
            
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")} style={{ marginTop: 16 }}>
                <Text>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
        
        
        
            </View>



    );




}
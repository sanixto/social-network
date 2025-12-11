import { authService } from '@/app/api/services/auth.service';
import { useCallback, useState } from 'react';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';

interface SignInDto {
 username: string;
 password: string;
}

const initialFormState: SignInDto = {
 username: '',
 password: '',
} as const;

export default function SignInForm() {
 const [formState, setFormState] = useState<SignInDto>(initialFormState);

 const handleChange = useCallback((key: keyof SignInDto, value: string) => {
  setFormState((prevState) => ({ ...prevState, [key]: value }));
 }, []);

 const handleSubmit = useCallback(() => {
  authService
   .signIn(formState.username, formState.password)
   .then((data) => {
    console.log('Signed in successfully, token:', data.access_token);
   })
   .catch((error) => {
    console.error('Sign in failed:', error.message);
   });
 }, [formState.username, formState.password]);

 return (
  <View style={styles.container}>
   <Text style={styles.title}>Sign In</Text>
   <View>
    <Text>Username</Text>
    <TextInput
     style={styles.input}
     value={formState.username}
     onChangeText={(value) => handleChange('username', value)}
    />
   </View>
   <View>
    <Text>Password</Text>
    <TextInput
     style={styles.input}
     secureTextEntry={true}
     value={formState.password}
     onChangeText={(value) => handleChange('password', value)}
    />
   </View>
   <View>
    <Button title="Sign In" onPress={handleSubmit} />
   </View>
  </View>
 );
}

const styles = StyleSheet.create({
 container: {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
 },
 title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
 input: {
  width: '100%',
  borderColor: 'gray',
  borderWidth: 1,
  marginBottom: 12,
  padding: 8,
 },
});

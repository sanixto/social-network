import { useState } from 'react';
import { Text, View, TextInput } from 'react-native';

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

 const handleChange = (key: keyof SignInDto, value: string) => {
  setFormState((prevState) => ({ ...prevState, [key]: value }));
 };

 return (
  <View
   style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
   }}
  >
   <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
    Sign In
   </Text>
   <View>
    <Text>Username</Text>
    <TextInput
     style={{
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      padding: 8,
     }}
     value={formState.username}
     onChangeText={(value) => handleChange('username', value)}
    />
   </View>
   <View>
    <Text>Password</Text>
    <TextInput
     style={{
      width: '100%',
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      padding: 8,
     }}
     secureTextEntry={true}
     value={formState.password}
     onChangeText={(value) => handleChange('password', value)}
    />
   </View>
  </View>
 );
}

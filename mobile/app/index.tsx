import { KeyboardAvoidingView, Platform, View } from 'react-native';
import SignInForm from './components/auth/SignInForm';

export default function Index() {
 return (
  <KeyboardAvoidingView
   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   }}
  >
   <View style={{ width: '70%' }}>
    <SignInForm />
   </View>
  </KeyboardAvoidingView>
 );
}

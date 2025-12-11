import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import SignInForm from './components/auth/SignInForm';

export default function Index() {
 return (
  <KeyboardAvoidingView
   behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   style={styles.container}
  >
   <View style={styles.formContainer}>
    <SignInForm />
   </View>
  </KeyboardAvoidingView>
 );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
 },
 formContainer: {
  width: '70%',
 },
});

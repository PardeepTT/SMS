import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Headline,
  Paragraph,
  Surface,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, error } = useContext(AuthContext);
  const theme = useTheme();
  
  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });
  
  const registerSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    role: Yup.string().required('Role is required'),
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Surface style={styles.surface}>
            <View style={styles.headerContainer}>
              <Headline style={styles.headline}>School Connect</Headline>
              <Paragraph style={styles.subheading}>
                Connecting parents and teachers for better education
              </Paragraph>
            </View>

            <View style={styles.formContainer}>
              <Title style={styles.title}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </Title>

              <Formik
                initialValues={
                  isLogin
                    ? { email: '', password: '' }
                    : {
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: '',
                        role: 'parent',
                      }
                }
                validationSchema={isLogin ? loginSchema : registerSchema}
                onSubmit={(values) => {
                  if (isLogin) {
                    login(values.email, values.password);
                  } else {
                    register(values.name, values.email, values.password, values.role);
                  }
                }}
              >
                {({
                  handleChange,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  setFieldValue,
                }) => (
                  <View style={styles.form}>
                    {!isLogin && (
                      <>
                        <TextInput
                          label="Name"
                          value={values.name}
                          onChangeText={handleChange('name')}
                          mode="outlined"
                          style={styles.input}
                        />
                        {touched.name && errors.name && (
                          <HelperText type="error">{errors.name}</HelperText>
                        )}
                      </>
                    )}

                    <TextInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      mode="outlined"
                      style={styles.input}
                    />
                    {touched.email && errors.email && (
                      <HelperText type="error">{errors.email}</HelperText>
                    )}

                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      secureTextEntry
                      mode="outlined"
                      style={styles.input}
                    />
                    {touched.password && errors.password && (
                      <HelperText type="error">{errors.password}</HelperText>
                    )}

                    {!isLogin && (
                      <>
                        <TextInput
                          label="Confirm Password"
                          value={values.confirmPassword}
                          onChangeText={handleChange('confirmPassword')}
                          secureTextEntry
                          mode="outlined"
                          style={styles.input}
                        />
                        {touched.confirmPassword && errors.confirmPassword && (
                          <HelperText type="error">
                            {errors.confirmPassword}
                          </HelperText>
                        )}

                        <View style={styles.roleContainer}>
                          <Text style={styles.roleLabel}>I am a:</Text>
                          <View style={styles.roleButtons}>
                            <Button
                              mode={values.role === 'parent' ? 'contained' : 'outlined'}
                              onPress={() => setFieldValue('role', 'parent')}
                              style={styles.roleButton}
                            >
                              Parent
                            </Button>
                            <Button
                              mode={values.role === 'teacher' ? 'contained' : 'outlined'}
                              onPress={() => setFieldValue('role', 'teacher')}
                              style={styles.roleButton}
                            >
                              Teacher
                            </Button>
                          </View>
                        </View>
                      </>
                    )}

                    {error && (
                      <HelperText type="error" style={styles.errorText}>
                        {error}
                      </HelperText>
                    )}

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      {isLogin ? 'Sign In' : 'Register'}
                    </Button>
                  </View>
                )}
              </Formik>

              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isLogin
                    ? "Don't have an account?"
                    : 'Already have an account?'}
                </Text>
                <Button
                  mode="text"
                  onPress={() => setIsLogin(!isLogin)}
                  style={styles.switchButton}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Button>
              </View>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  switchText: {
    marginRight: 5,
  },
  switchButton: {
    marginLeft: 5,
  },
  roleContainer: {
    marginTop: 10,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 5,
  },
});

export default AuthScreen;

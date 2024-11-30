import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, TextInput, ImageBackground } from 'react-native';

function SignUpButton({ text, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.signInButton}>
        <Text style={styles.signInButtonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function SignUpScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../assets/newAssets/universalAssets/NewBackground1.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/newAssets/universalAssets/LuminaLogoNew.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Login To Your Account</Text>

        {/* Email Input */}
          <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholderTextColor="#808080"
            placeholder="Email"
          />
        </View>

        {/* Password Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholderTextColor="#808080"
              placeholder="Password"
              secureTextEntry
            />
          </View>

        {/* Sign In Button */}
        <SignUpButton text="Sign In" onPress={() => navigation.navigate("Tabs")} />

        {/* Bottom Text */}
        <TouchableOpacity onPress={() => navigation.navigate("signUpScreen")}>
          <Text style={styles.bottomText}>
            Don’t have an account? <Text style={styles.signUpText}> SIGN UP</Text>
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ImageBackground>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 0,
  },
  safeAreaContainer: {
    marginTop: 50, 
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 320,
    height: 150,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 35,
    marginLeft: 25,
    opacity: 0.5,
    letterSpacing: 0.5,
    fontFamily: 'Nunito',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    opacity: 0.8,
    shadowColor: '#000',
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 17,
    fontFamily: 'Nunito',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  signInButton: {
    backgroundColor: '#BA91F9',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  signInButtonText: {
    color: '#000',
    fontSize: 21,
    fontWeight: 'semibold',
    letterSpacing: 0.5,
    fontFamily: 'Nunito',
  },
  bottomText: {
    textAlign: 'left',
    marginHorizontal: 25,
    color: '#29395E',
    fontSize: 17,
    marginTop: 130,
    fontStyle: 'nunito',
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#BA91F9',
    fontWeight: '600',
    opacity: 0.7,
  },
});

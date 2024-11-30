import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity, TextInput, ImageBackground, Button, Touchable } from 'react-native';

function SignUpButton({ text, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.signUpButton}>
        <Text style={styles.signUpButtonText}>{text}</Text>
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
        <Text style={styles.title}>Create Your Account</Text>

        {/* Username Input */}
          <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholderTextColor="#808080"
            placeholder="Username"
          />
        </View>
        
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

        {/* Sign Up Button */}
        <SignUpButton text="Sign Up" onPress={() => navigation.navigate("Tabs")} />

        {/* Bottom Text */}
        <TouchableOpacity onPress={() => navigation.navigate("signInScreen")}>
          <Text style={styles.bottomText}>
            Already have an account? <Text style={styles.signUpText}> SIGN IN</Text>
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
    color: '#2a3249',
    fontSize: 17,
    fontFamily: 'Nunito',
    letterSpacing: 0.3,
    opacity: 0.8,
  },
  signUpButton: {
    backgroundColor: '#BA91F9',
    borderRadius: 15,
    marginHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  signUpButtonText: {
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

/*import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, Text, View, Button, SafeAreaView, Image, TouchableOpacity, TextInput, ImageBackground, Touchable} from 'react-native';

function ExistingAccount ({text, onPress}) {
  return(
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.buttonText}>{ text }</Text>
    </TouchableOpacity>
  )
}

function SignUpButton ({text, onPress}) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={signUpButtonStyles.button}>
        <Text style={signUpButtonStyles.buttonText}>{ text }</Text>
      </View>
    </TouchableOpacity>
  )
}


export default function SignUpScren({navigation}) {

  return (

    <ImageBackground source={require("/Users/apple/Lumina_Final/Lumina/assets/signInScreenImages/signUpBackground.png")}
    style={styles.container}>
      <SafeAreaView>
        <View>
          <Image source={require("/Users/apple/Lumina_Final/Lumina/assets/signUpImages/lumina-logo.png")} style={styles.logo}/>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>Create your Account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Image style={styles.emailIcon} source={require('/Users/apple/Lumina_Final/Lumina/assets/signUpImages/icons8-email-24.png')}/>
          <TextInput style={styles.textInput} placeholderTextColor="#0F1630" placeholder="Email"/>
        </View>

         <View style={styles.inputContainer}>
          <Image style={styles.usernameIcon} source={require('/Users/apple/Lumina_Final/Lumina/assets/signUpImages/icons8-person-24.png')}/>
          <TextInput style={styles.textInput} placeholderTextColor="#0F1630" placeholder="Username"/>
         </View>

         <View style={styles.inputContainer}>
          <Image style={styles.passwordIcon} source={require('/Users/apple/Lumina_Final/Lumina/assets/signUpImages/icons8-password-24.png')}/>
          <TextInput style={styles.textInput} placeholderTextColor="#0F1630" placeholder="Password"/>
         </View>

         <View style={styles.inputContainer}>
          <Image style={styles.locationIcon} source={require('/Users/apple/Lumina_Final/Lumina/assets/signUpImages/icons8-location-24.png')}/>
          <TextInput style={styles.textInput} placeholderTextColor="#0F1630" placeholder="City, State"/>
         </View>

          <SignUpButton text="Sign Up" onPress={() => navigation.navigate("Tabs")}/>

         <ExistingAccount text="Already have an account? Login" onPress={() => navigation.navigate("signInScreen")}/>

      </SafeAreaView>
    </ImageBackground>

  );
};

const existingAccountButtonStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    bottom: 20
    },
buttonText: {
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
}
});

const signUpButtonStyles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: '#7D62A9',
    opacity: 10,
    flexDirection: 'row',
    borderRadius: 10,
    marginHorizontal: 40,
    elevation: 10,
    marginaVertical: 20,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
},
buttonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
}
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis:0,

  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '500',
    color: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '400',
    color: 'white',
    alignSelf: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    borderRadius: 10,
    marginHorizontal: 40,
    elevation: 10,
    marginaVertical: 20,
    alignItems: 'center',
    height: 50,
  },
  emailIcon: {
    marginLeft: 10,
  },
  usernameIcon: {
    marginLeft: 10,
  },
  passwordIcon: {
    marginLeft: 10,
  },
  locationIcon: {
    marginLeft: 10,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
  },
  signUpContainer: {
    marginTop: 20,
    backgroundColor: '#7D62A9',
    opacity: 10,
    flexDirection: 'row',
    borderRadius: 10,
    marginHorizontal: 40,
    elevation: 10,
    marginaVertical: 20,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center', //gets sign up to center
  },
  signUp: {
    textAlign: 'center',
    color: 'white',
    fontSize: 15,
  },
  loginStyle: {
    marginTop: 40,
  },
  alreadyAccount: {
    marginTop: 20,
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  login: {
    color: '#7D62A9',
    fontSize: 15,
    fontWeight: '700',
  }
});
*/
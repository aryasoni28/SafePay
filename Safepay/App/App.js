import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from './Components/welcome';
import HomePage from './Components/homepage'
import AboutUsPage from './Components/aboutus';
import LoginPage from './Components/loginpage'
import SignupPage from './Components/SignupPage';
import MainPage from './Components/Mainpage';
import OptionsPage from './Components/options';
import BalancePage from './Components/balance';
import PayPage from './Components/Pay';
import ReportPage from './Components/report';
import CreateBankAccountPage from './Components/createaccount';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AboutUs"
          component={AboutUsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Mainpage"
          component={MainPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Options"
          component={OptionsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Balance"
          component={BalancePage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="pay"
          component={PayPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Report"
          component={ReportPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateAccount"
          component={CreateBankAccountPage}
          options={{ headerShown: false }}
        />
        {/* Add other screens and navigation configurations here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
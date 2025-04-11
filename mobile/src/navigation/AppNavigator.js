import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import { AuthContext } from '../context/AuthContext';
import ParentDashboard from '../screens/parent/ParentDashboard';
import StudentDetails from '../screens/parent/StudentDetails';
import Messaging from '../screens/parent/Messaging';
import Calendar from '../screens/parent/Calendar';
import SchoolNews from '../screens/parent/SchoolNews';
import Resources from '../screens/parent/Resources';
import TeacherDashboard from '../screens/teacher/TeacherDashboard';
import StudentManagement from '../screens/teacher/StudentManagement';
import Attendance from '../screens/teacher/Attendance';
import Grades from '../screens/teacher/Grades';
import Assignments from '../screens/teacher/Assignments';
import Announcements from '../screens/teacher/Announcements';
import Profile from '../screens/common/Profile';
import Notifications from '../screens/common/Notifications';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'parent' ? (
        <>
          <Stack.Screen name="ParentDashboard" component={ParentDashboard} />
          <Stack.Screen name="StudentDetails" component={StudentDetails} />
          <Stack.Screen name="Messaging" component={Messaging} />
          <Stack.Screen name="Calendar" component={Calendar} />
          <Stack.Screen name="SchoolNews" component={SchoolNews} />
          <Stack.Screen name="Resources" component={Resources} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Notifications" component={Notifications} />
        </>
      ) : (
        <>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
          <Stack.Screen name="StudentManagement" component={StudentManagement} />
          <Stack.Screen name="Attendance" component={Attendance} />
          <Stack.Screen name="Grades" component={Grades} />
          <Stack.Screen name="Assignments" component={Assignments} />
          <Stack.Screen name="Announcements" component={Announcements} />
          <Stack.Screen name="Messaging" component={Messaging} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Notifications" component={Notifications} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;

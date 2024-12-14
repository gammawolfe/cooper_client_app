import React from "react";
import { Redirect } from 'expo-router';
import { useAuth } from "@/context/AuthContextProvider";

const index = () => {
  const { user } = useAuth();

//   if (loading) {
//     return null; // Render nothing while loading
//   }

  // Redirect based on the session state
  return <Redirect href={user ? "/(tabs)" : "/(auth)/login"} />;
}

export default index
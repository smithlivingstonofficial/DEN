import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup, db, doc, setDoc, getDoc } from "../firebaseConfig";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the user profile already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          profileComplete: false,
        });
      }

      navigate("/home");  // Redirect to home
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
};

export default Login;

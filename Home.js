import React, { useEffect, useState } from "react";
import { auth, db, doc, getDoc } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return navigate("/");

      setUser(currentUser);
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && !userDocSnap.data().profileComplete) {
        setShowPopup(true);
      }
    };

    checkUserProfile();
  }, [navigate]);

  return (
    <div>
      <Navbar user={user} />
      <h1>Welcome to DEN</h1>

      {showPopup && (
        <div className="popup">
          <p>Your profile is incomplete! Please complete it.</p>
          <button onClick={() => navigate("/profile")}>Complete Profile</button>
        </div>
      )}
    </div>
  );
};

export default Home;

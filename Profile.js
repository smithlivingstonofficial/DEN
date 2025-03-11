import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth, db, storage } from "../firebaseConfig"; // Import Firebase services
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  Box,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    dob: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    gpsLocation: "",
    password: "",
    securityQuestion: "",
    emergencyContacts: [], // 🔹 Ensure it's always an array
    medicalInfo: "",
    notifications: "email",
    language: "English",
    agreedToTerms: false,
    profilePic: "",
    familyMembers: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profileRef = doc(db, "users", user.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setProfile({ ...profile, ...profileSnap.data() });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const updateProfile = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "users", user.uid), profile, { merge: true });
      alert("Profile Updated Successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }

    setLoading(false);
  };

  const handleProfilePicUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfile({ ...profile, profilePic: downloadURL });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture.");
    }

    setLoading(false);
  };

  const handleAddEmergencyContact = () => {
    setProfile({
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, { name: "", phone: "" }]
    });
  };

  const handleRemoveEmergencyContact = (index) => {
    setProfile({
      ...profile,
      emergencyContacts: profile.emergencyContacts.filter((_, i) => i !== index)
    });
  };

  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = profile.emergencyContacts.map((contact, i) =>
      i === index ? { ...contact, [field]: value } : contact
    );
    setProfile({ ...profile, emergencyContacts: updatedContacts });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Profile Information
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              type="date"
              label="Date of Birth"
              InputLabelProps={{ shrink: true }}
              value={profile.dob}
              onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Emergency Contacts</Typography>
            {profile?.emergencyContacts?.map((contact, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={contact.name}
                    onChange={(e) => handleEmergencyContactChange(index, "name", e.target.value)}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    value={contact.phone}
                    onChange={(e) => handleEmergencyContactChange(index, "phone", e.target.value)}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton color="secondary" onClick={() => handleRemoveEmergencyContact(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddEmergencyContact}>
              Add Contact
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" component="label">
              Upload Profile Picture
              <input type="file" hidden onChange={handleProfilePicUpload} />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={updateProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Profile;

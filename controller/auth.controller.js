const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user.model.js');
const Wallet = require('../models/wallet.models.js');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const register = async(req, res)=>{
try {
    const { username, email, password } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const existingUsername = await User.findOne({username : username})

    if(existingUsername) return res.status(400).json({error:"Sorry, this username is taken"})

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }


    const newUser = new User({
      username,
      email,
      password,
    });

    const userWallet = new Wallet({
        user: newUser._id
    })

    await newUser.save();
    await userWallet.save()

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await sendVerificationEmail(newUser.email, token);

    return res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${BASE_URL}/verify?token=${token}`;

  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'Email Verification From Home Work Tips',
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

const login = async(req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid =  bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    await User.findByIdAndUpdate(userId, { isVerified: true });

    return res.json({message:"Account verification successfully!"})
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
    register,
    login,
    verifyEmail
}

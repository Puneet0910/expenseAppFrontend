require("dotenv").config();
const SibApiV3Sdk = require("sib-api-v3-sdk");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ForgotPassword = require("../models/forgotPassword");

// Configure Sendinblue API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.apiClient.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log('Received email:', email);

    const user = await User.findOne({ where: { email } });
    console.log('User found:', user);

    if (user) {
      const id = uuid.v4();
      console.log('Generated UUID:', id);

      // Create forgot password request
      await ForgotPassword.create({ id, userId: user.id, active: true });
      console.log('Forgot password request created');

      // Send password reset email via Sendinblue
      const sender = { email: 'nainwalpuneet@gmail.com' }; // Replace with your sender email
      const receiver = [{ email }];

      const emailOptions = {
        sender,
        to: receiver,
        subject: 'Forgot Password',
        htmlContent: `<p>Hello,</p><p>Click the link below to reset your password:</p><p><a href="http://localhost:3000/password/resetPassword/${id}">Reset password</a></p>`,
      };

      try {
        await apiInstance.sendTransacEmail(emailOptions);
        console.log('Email sent successfully');
        res.status(200).json({
          message: "Link to reset password sent to your email",
          success: true,
        });
      } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: "Error sending password reset email", success: false });
      }
    } else {
      console.error("User not found");
      return res.status(404).json({ message: "User doesn't exist", success: false });
    }
  } catch (err) {
    console.error("Error in forgotPassword controller:", err);
    return res.status(500).json({ message: err.message, success: false });
  }
};



exports.resetPassword = async (req, res, next) => {
  const id = req.params.id;

  try {
    const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id: id } });

    if (forgotPasswordRequest) {
      await forgotPasswordRequest.update({ active: false });

      res.status(200).send(`<html>
        <script>
          function formsubmitted(e){
            e.preventDefault();
            console.log('called')
          }
        </script>
        <form action="/password/updatePassword/${id}" method="get">
          <label for="newpassword">Enter New password</label>
          <input name="newpassword" type="password" required />
          <button>Reset password</button>
        </form>
      </html>`);
    } else {
      res.status(404).json({ message: "Invalid reset link", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { newpassword } = req.query;
    const { id } = req.params;

    const forgotPasswordRequest = await ForgotPassword.findOne({ where: { id: id } });

    if (forgotPasswordRequest) {
      const user = await User.findOne({ where: { id: forgotPasswordRequest.userId } });

      if (user) {
        // Encrypt the new password
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(newpassword, salt);

        await user.update({ password: hash });

        res.status(201).json({ message: "Successfully updated the new password", success: true });
      } else {
        res.status(404).json({ message: "No user exists", success: false });
      }
    } else {
      res.status(404).json({ message: "Invalid reset link", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

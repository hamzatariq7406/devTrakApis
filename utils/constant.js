const EMAIL = {
  FORGOT_PASSWORD_BODY: (token) => {
    return `<p>Hello,</p>
          <br />
          <p>You recently requested a password reset for your account. Click the link below to reset your password:</p>
          <p><a href=${
            process.env.FRONT_END_URL + "/reset-password/" + token
          } target="_blank">Reset Password</a></p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <br />
          <p>Best regards,<br>Dev-Autotrack.ai</p>`;
  },
  FORGOT_PASSWORD_SUBJECT: "Password Reset Request",
  USER_REGISTRATION_SUBJECT: "Dev-Autotrack.ai Account Creation Request",
  USER_REGISTRATION_BODY: (token) => {
    return `<p>Hello,</p>
                    <br />
                    <p>Thank you for signing up with us!</p>
                    <p>To complete your registration, please use the following confirmation code:</p>
                    <br />
                    <h2 style="background-color: #f0f0f0; padding: 10px; text-align: center;">${token}</h2>
                    <br />
                    <p>If you didn't sign up for our service, please ignore this email.</p>
                    <br />
                    <p>Best regards,<br>Dev-Autotrack Team</p>`;
  },
};

export { EMAIL };

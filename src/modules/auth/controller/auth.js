import userModel from '../../../../DB/model/User.model.js';

import {compareSync, hashSync } from '../../../utils/HashAndCompare.js';
import sendEmail from '../../../utils/email.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import { customAlphabet } from 'nanoid';
import { generateToken, verifyToken } from '../../../utils/generateAndVerifyToken.js';

//signUp
export const signUp = asyncHandler(async (req, res, next) => {
  const { email, userName, password } = req.body;
  //check email
  const user = await userModel.findOne({ email });
  if (user) {
    return next(new Error('Email already exists'), { cause: 409 });
  }
  let html;
  //confirm email
  const token = generateToken({
    payload: { email },
    expiresIn: 60 * 5,
    signature: process.env.TOKEN_SIGNATURE,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;
  const rfToken = generateToken({
    payload: { email },
    expiresIn: 60 * 60 * 24,
    signature: process.env.TOKEN_SIGNATURE,
  });
  const rfLink = `${req.protocol}://${req.headers.host}/auth/requestNewConfirmEmail/${rfToken}`;

  await sendEmail({
    to: email,
    html: `<!DOCTYPE html>
            <html>
            <head>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
            <style type="text/css">
            body{background-color: #88BDBF;margin: 0px;}
            </style>
            <body style="margin:0px;"> 
            <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
            <tr>
            <td>
            <table border="0" width="100%">
            <tr>
            <td>
            <h1>
                <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
            </h1>
            </td>
            <td>
            <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
            </td>
            </tr>
            </table>
            </td>
            </tr>
            <tr>
            <td>
            <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
            <tr>
            <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
            <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
            </td>
            </tr>
            <tr>
            <td>
            <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
            </td>
            </tr>
            <tr>
            <td>
            <p style="padding:0px 100px;">
            </p>
            </td>
            </tr>
            <tr>
            <td>
            <a href="${link}" style="margin:50px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
            </td>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </br>
            </tr>
            <tr>
            <td>
            <a href="${rfLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Re-send</a>
            </td>
            </tr>
            </table>
            </td>
            </tr>
            <tr>
            <td>
            <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
            <tr>
            <td>
            <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
            </td>
            </tr>
            <tr>
            <td>
            <div style="margin-top:20px;">
    
            <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
            
            <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
            </a>
            
            <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
            </a>
    
            </div>
            </td>
            </tr>
            </table>
            </td>
            </tr>
            </table>
            </body>
            </html>`,
  });

  //hash password
  const hashPassword = hashSync({ plaintext: password });
  const { _id } = await userModel.create({
    email,
    userName,
    password: hashPassword,
  });
  return res.status(201).json({ message: 'Done', _id });
});

//badAccount to make user insert a valid email account
export const badAccount = asyncHandler(async (req, res, next) => {
  return res.send(
    '<p style="color:red">If you did not get a confirm email Please make sure of your email first to get the confirm email</p>'
  );
});

//confirmEmail
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({
    token,
    signature: process.env.TOKEN_SIGNATURE,
  });
  if (!email) {
    return next(new Error('In-valid Token Payload', { cause: 400 }));
  }
  const user = await userModel.updateOne({ email }, { confirmEmail: true });
  if (!user) {
    return next(new Error('Not registered account', { cause: 400 }));
  } else if (user?.matchedCount) {
    return res.status(200).json({ message: 'Done', email });
  }
});

//requestNewConfonfirmEmail
export const requestNewConfirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = verifyToken({
    token,
    signature: process.env.TOKEN_SIGNATURE,
  });
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error('Not registered account'));
  } else if (user.confirmEmail == true) {
    return res
      .status(200)
      .send('<p>Your account is already confirmed go to login page</p>');
  }
  const newToken = generateToken({
    payload: { email },
    expiresIn: 60 * 2,
    signature: process.env.TOKEN_SIGNATURE,
  });
  const link = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newToken}`;

  const rfLink = `${req.protocol}://${req.headers.host}/auth/reqNewEmail/${token}`;
  await sendEmail({
    to: email,
    subject: 'Confirm Email',
    html: `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body style="margin:0px;">
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
        <tr>
        <td>
        <table border="0" width="100%">
        <tr>
        <td>
        <h1>
            <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
        </h1>
        </td>
        <td>
        <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
        <tr>
        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top:25px; color:#630E2B">Email Confirmation</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding:0px 100px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
        <a href="${link}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Verify Email address</a>
        </td>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </br>
        </tr>
        <tr>
        <td>
        <a href="${rfLink}" style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">Re-send</a>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
        <tr>
        <td>
        <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
        </td>
        </tr>
        <tr>
        <td>
        <div style="margin-top:20px;">

        <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>

        <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
        </a>

        <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
        </a>

        </div>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </body>
        </html>`,
  });
  return res
    .status(200)
    .send(
      '<p>New Confirmation email sent to your Mailbox please check as soon as possible </p>'
    );
});

//logIn
export const logIn = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error('Email does not exist'), { cause: 404 });
  }

  if (!user.confirmEmail) {
    return next(new Error('please confirm your email First'),{cause:403});
  }

  if (
    !compareSync({
      plaintext: password,
      hashValue: user.password,
    })
  ) {
    return next(new Error('In-valid login data'));
  }
  const token = generateToken({
    payload: { id: user._id, role: user.role },
    expiresIn: 60 * 30,
  });
  const refresh_Token = generateToken({
    payload: { id: user._id, role: user.role },
    expiresIn: 60 * 60 * 24 * 365,
  });
  await userModel.updateOne({email},{status:'Online'})
  await userModel.save;
  return res.status(200).json({ message: 'Done', token, refresh_Token });
});

// forget password send email code
export const sendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // code that is sent to email account to reset password and is saved
  let code = customAlphabet('0123456789', 4);
  code = code();
  // const code= Math.floor(Math.random()*(9999-1000+1)+1000)
  const user = await userModel.findOneAndUpdate(
    { email },
    { forgetCode: code },
    { new: true }
  );
  if (!user || !user.forgetCode) {
    return next(new Error('Not registered user'));
  }
  const html = `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body style="margin:0px;"> 
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
        <tr>
        <td>
        <table border="0" width="100%">
        <tr>
        <td>
        <h1>
            <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
        </h1>
        </td>
        <td>
        <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
        <tr>
        <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
        <img width="50px" height="50px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top:25px; color:#630E2B">Forget Password</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding:0px 100px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
        <p style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B; ">${code}</p>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
        <tr>
        <td>
        <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
        </td>
        </tr>
        <tr>
        <td>
        <div style="margin-top:20px;">

        <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
        
        <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
        </a>
        
        <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
        <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
        </a>

        </div>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </body>
        </html>`;
  if (!sendEmail({ to: email, subject: 'Forget Password', html })) {
    return next(
      new Error('Email rejected',{cause:404})
    );
  }
  return res.status(200).json({ message: 'Done' });
});

//get code and update password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, forgetCode, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new Error('Not registered user'), { cause: 400 });
  }
  if (user.forgetCode !== forgetCode) {
    return next(new Error('In-valid reset code'), { cause: 400 });
  }
  if (compareSync({ plaintext: password, hashValue: await user.password })) {
    return next(
      new Error('Please choose a different password', { cause: 409 })
    );
  }
  user.password = hashSync({ plaintext: password });
  user.forgetCode = null;
  user.changePasswordTime = Date.now();
  await user.save();
  return res.status(200).json({ message: 'Done', user });
});

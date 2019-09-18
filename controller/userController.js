import { OAuth2Client } from 'google-auth-library';

import { userModel } from '../models';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// eslint-disable-next-line consistent-return
const verifyAuthToken = async token => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.OAUTH_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (err) {
    console.error('Error veryfying auth token ', err);
  }
};

const checkIfUserExist = async googleId => await userModel.findOne({ googleId }).exec();

const createNewUser = googleUser => {
  const { id, displayName, picture } = googleUser;

  userModel.findOne({ googleId: id }, (err, userData) => {
    if (err) return new Error(err);
    if (!userData) {
      userModel.create({ googleId: id, name: displayName, picture }).then(created => {
        return created;
      });
    } else {
      // res.redirect(`${clientPath}`);
    }
    return null;
  });
};

const findOrCreateUser = async token => {
  const googleUser = await verifyAuthToken(token);
  const user = await checkIfUserExist(googleUser.email);
  return user || createNewUser(googleUser);
};

export default findOrCreateUser;

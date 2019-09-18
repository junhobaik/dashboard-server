import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

require('dotenv').config();

// const callbackURL =
//   process.env.NODE_ENV === 'development'
//     ? 'http://localhost:4000/auth/google/callback'
//     : `${process.env.AWS_PUBLIC_DNS}/auth/google/callback`;

const callbackURL =
  'http://ec2-54-180-95-94.ap-northeast-2.compute.amazonaws.com:4000/auth/google/callback';

module.exports = passport => {
  passport.serializeUser((user, done) => {
    console.log('serializeUser', Object.keys(user));
    done(null, user.profile);
  });

  passport.deserializeUser((user, done) => {
    console.log('deserializeUser', user.profile.displayName);
    done(null, user.profile);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_ID,
        callbackURL,
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        process.nextTick(() => {
          return done(null, {
            accessToken,
            refreshToken,
            profile
          });
        });
      }
    )
  );
};

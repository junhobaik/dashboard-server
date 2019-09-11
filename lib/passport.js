import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

module.exports = passport => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET_ID,
        callbackURL: 'http://localhost:4000/auth/google/callback',
        proxy: true
      },
      (accessToken, refreshToken, profile, cb) => {
        process.nextTick(() => {
          return cb(null, profile);
        });
      }
    )
  );
};

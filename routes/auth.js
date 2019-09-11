/* eslint-disable no-unused-vars */
import express from 'express';
import passport from 'passport';

import { userModel } from '../models';

const router = express.Router();

const clientPath = 'http://localhost:3000';

router.get('/google', passport.authenticate('google', { scope: ['profile'] }), (req, res) => {});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: clientPath }),
  (req, res) => {
    const { id, displayName } = req.user;
    const { picture } = req.user._json;

    userModel.findOne({ googleId: id }, (err, userData) => {
      if (err) return new Error(err);
      if (!userData) {
        userModel
          .create({ googleId: id, name: displayName, picture })
          .then((created, error) => {
            return created;
          })
          .finally(() => {
            res.redirect(`${clientPath}/board`);
          });
      } else {
        res.redirect(`${clientPath}`);
      }
      return null;
    });
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(clientPath);
});

export default router;

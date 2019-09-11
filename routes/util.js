/* eslint-disable consistent-return */

export default (req, res, next) => {
  if (req.isAuthenticated()) {
    console.log('> isAuthenticated: ', true);
    return next();
  }
  console.log('> isAuthenticated: ', false);
  res.sendStatus(401);
};

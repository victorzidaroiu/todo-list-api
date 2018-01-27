import credential from 'credential';
import validator from 'validator';
import swearjar from 'swearjar';
import { models } from '../pg';
import {
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '../includes/constants';

export default (req, res) => {
  const { username = '', password = '', email = '' } = req.body;
  const errors = [];

  if (!validator.isEmail(email)) {
    errors.push('INVALID_EMAIL');
  }

  if (swearjar.profane(username)) {
    errors.push('INVALID_USERNAME_PROFANE');
  }

  if (username.length < USERNAME_MIN_LENGTH) {
    errors.push('INVALID_USERNAME_TOO_SHORT');
  }

  if (username.length > USERNAME_MAX_LENGTH) {
    errors.push('INVALID_USERNAME_TOO_LONG');
  }

  if (username.match(/.*\d.*/g)) {
    errors.push('INVALID_USERNAME_NO_NUMBERS');
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push('INVALID_PASSWORD_TOO_SHORT');
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push('INVALID_PASSWORD_TOO_LONG');
  }

  if (!errors.length) {
    const pw = credential();

    pw.hash(password, async (err, hash) => {
      if (err) { throw err; }

      const duplicateUsername = await models.user.find({ where: { username } });

      if (duplicateUsername) {
        errors.push('INVALID_USERNAME_DUPLICATE');
      }

      const duplicateEmail = await models.user.find({ where: { email } });

      if (duplicateEmail) {
        errors.push('INVALID_EMAIL_DUPLICATE');
      }

      if (!errors.length) {
        models.user
          .create({ username, password: hash, email })
          .then((user) => {
            res.json({
              data: {
                id: user.id,
              },
            });
          });
      } else {
        res.json({
          errors,
        });
      }
    });
  } else {
    res.json({
      errors,
    });
  }
};

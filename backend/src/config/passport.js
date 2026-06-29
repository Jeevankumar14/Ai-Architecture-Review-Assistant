import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import env from './env.js';

const configurePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  if (env.googleClientId && env.googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.googleClientId,
          clientSecret: env.googleClientSecret,
          callbackURL: env.googleCallbackUrl,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              // Update avatar if changed
              if (profile.photos?.[0]?.value && user.avatar !== profile.photos[0].value) {
                user.avatar = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value || user.avatar;
              await user.save();
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value || '',
              isEmailVerified: true,
              authProvider: 'google',
            });

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('✅ Google OAuth strategy configured');
  } else {
    console.warn('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET)');
  }
};

export default configurePassport;

import dotenv from 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

// Routes
import indexRouter from './routes/index';
import usersRouter from './routes/users';
import artistsRouter from './routes/artists';

// Social Media Login Dependencies
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import GoogleStrategy from 'passport-google-oauth20';
import { facebook, google } from "./config";

// Transform Facebook profile because Facebook and Google profile objects look different
// and we want to transform them into user objects that have the same set of attributes
const transformFacebookProfile = (profile) => ({
    name: profile.name,
    avatar: profile.picture.data.url,
});

// Transform Google profile into user object
const transformGoogleProfile = (profile) => ({
    name: profile.displayName,
    avatar: profile.image.url,
});

// Register Facebook Passport strategy
passport.use(new FacebookStrategy(facebook,
    // Gets called when user authorizes access to their profile
    async (accessToken, refreshToken, profile, done)
    // Return done callback and pass transformed user object
        => done(null, transformFacebookProfile(profile._json))
));

// Register Google Passport strategy
passport.use(new GoogleStrategy(google,
    async (accessToken, refreshToken, profile, done)
        => done(null, transformGoogleProfile(profile._json))
));

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
    origin: 'http://localhost:3006',
    credentials: true
}));

// Social Login
app.use(passport.initialize());
app.use(passport.session());

// Set up Facebook auth routes
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: '/auth/facebook'}),
    // Redirect user back to the mobile app using Linking with a custom protocol OAuthLogin
    (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));

// Set up Google auth routes
app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}));
app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/auth/google'}),
    (req, res) => res.redirect('OAuthLogin://login?user=' + JSON.stringify(req.user)));


// Routing Middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/artists', artistsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const port = process.env.PORT || 1928;
const server = app.listen(port, () => {
    const {port} = server.address();
    console.log(`Listening at http://127.0.0.1:${port}`);
});

module.exports = app;

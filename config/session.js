require("dotenv").config();
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("./passport");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const SECRET = process.env.SECRET;

const sessionMiddleware = session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }),
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  },
});

const initializeSession = (app) => {
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = initializeSession;

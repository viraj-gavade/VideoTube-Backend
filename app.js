require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Import Express framework for routing
const cookieParser = require('cookie-parser'); // Middleware to parse cookies
const connectdb = require('./DataBase/connect'); // Database connection utility
const path = require('path'); // To handle and transform file paths
const { ApolloServer } = require('@apollo/server'); // Import ApolloServer for GraphQL
const { expressMiddleware } = require('@apollo/server/express4'); // Express middleware for Apollo Server
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing (CORS)
const asyncHandler = require('./utils/asynchandler'); // Custom async handler utility
const { GraphQLScalarType, Kind } = require('graphql'); // For custom GraphQL scalar types
const session = require('express-session'); // Express session middleware
const OauthRouter = require('./Routes/Oauth2.router'); // OAuth2 authentication routes
const passport = require('passport'); // Passport authentication middleware 

const gql = require('graphql-tag'); // To parse GraphQL queries and mutations

// Models
const Video = require('./Models/video.models'); // Video model
const User = require('./Models/users.models'); // User model

// Routers
const UserRouter = require('./Routes/users.routers'); // User-related API routes
const VideoRouter = require('./Routes/videos.routers'); // Video-related API routes
const CommentRouter = require('./Routes/comments.routers'); // Comment-related API routes
const healthCheck = require('./Controllers/healthcheck.controllers'); // Health check endpoint
const subscriptionRouter = require('./Routes/subscritption.routers'); // Subscription API routes
const LikeRouter = require('./Routes/like.routers'); // Like API routes
const DashboardRouter = require('./Routes/dashboard.router'); // Dashboard-related routes
const VerifyJwt = require('./Middlerwares/auth'); // Middleware to verify JWT tokens

const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Set the port from environment variable or default to 3000

// Middleware Setup
app.use(express.json()); // Parse incoming JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static('public')); // Serve static files from the 'public' folder

app.use(cookieParser()); // Initialize cookie parser
app.use(cors()); // Enable CORS

// View Engine Setup
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.resolve('./views')); // Set the views directory path

// Session Management
app.use(session({
  secret: process.env.SECRETE, // Session secret key from environment variable
  resave: false, // Do not save the session if unmodified
  saveUninitialized: true, // Save session even if it's not modified
  cookie: { secure: false } // Set secure to true in production with HTTPS
}));

// Passport Setup for Authentication
app.use(passport.initialize()); // Initialize Passport for authentication
app.use(passport.session()); // Enable session management for Passport

// API Routes Setup
app.use('/api/v1/auth/user', UserRouter); // User authentication-related routes
app.use('/api/v1/videos', VideoRouter); // Video-related routes
app.use('/api/v1/comments', CommentRouter); // Comment-related routes
app.use('/api/v1/healthcheck', healthCheck); // Health check endpoint
app.use('/api/v1/subscriptions', subscriptionRouter); // Subscription-related routes
app.use('/api/v1/likes', LikeRouter); // Like-related routes
app.use('/api/v1/dashboard', DashboardRouter); // Dashboard-related routes

// OAuth2 Routes
app.use('/', OauthRouter); // Mount OAuth2 routes

// GraphQL Schema and Resolvers
const typeDefs = gql`
"""Custom scalar type for Date handling"""
  scalar Date 

  type Video {
    id: ID!
    title: String!
    createdAt: Date
    views: Int
    thumbnail: String
    duration: Float
    owner: User
  }

  type User {
    id: ID!
    username: String!
    avatar: String!
  }

  type Query {
    getVideoInfo: [Video]
    getUserById(id: ID!): User
  }
`;

const resolvers = {
  // Custom Date scalar type handling
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Custom Date scalar type',
    parseValue(value) {
      return new Date(value); // Convert client input to JavaScript Date object
    },
    serialize(value) {
      return value instanceof Date ? value.toISOString() : null; // Convert Date to ISO string for response
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value); // Parse string literal into Date
      }
      return null;
    },
  }),

  // Resolvers for Video type
  Video: {
    owner: async (video) => {
      try {
        const user = await User.findById(video.owner); // Fetch the owner of the video
        return user;
      } catch (error) {
        console.error('Error fetching owner:', error);
        throw new Error('Unable to fetch owner information');
      }
    },
  },

  // Query resolvers
  Query: {
    getVideoInfo: async () => {
      try {
        const videos = await Video.find({ isPublished: true }).populate('owner'); // Fetch published videos with owner data
        return videos;
      } catch (error) {
        console.error('Error fetching videos:', error);
        throw new Error('Unable to fetch video information');
      }
    },
    getUserById: async (_, { id }) => {
      try {
        const user = await User.findById(id); // Fetch user by ID
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Unable to fetch user information');
      }
    },
  },
};

// Create Apollo Server instance
const server = new ApolloServer({ typeDefs, resolvers });

// GraphQL Query Example and Express Route
(async () => {
  const { request } = await import('graphql-request'); // Dynamic import for GraphQL request

  // Define the GraphQL query to fetch video data
  const GET_VIDEOS_QUERY = `
    query {
      getVideoInfo {
        id
        title
        createdAt
        views
        thumbnail
        owner {
          username
          avatar
        }
      }
    }
  `;

  // Express route to render the home page with video data
  app.get('/home', VerifyJwt, async (req, res) => {
    try {
      const data = await request('http://localhost:3000/graphql', GET_VIDEOS_QUERY, {
        headers: {
          'Content-Type': 'application/json', // Set Content-Type header for JSON response
        },
      });
      res.render('home', { videos: data.getVideoInfo, user: req.user }); // Render home page with video data
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).send('Error fetching data');
    }
  });
})();

// Database Connection and Server Initialization
const ConnectDB = async () => {
  try {
    await connectdb(); // Connect to the database
    await server.start(); // Start Apollo Server
    app.use('/graphql', expressMiddleware(server)); // Middleware for GraphQL requests

    app.listen(port, () => {
      console.log(`Server is listening on port: ${port}`); // Log when the server starts
    });
  } catch (error) {
    console.error('Something Went Wrong!!', error); // Log any connection errors
    process.exit(1); // Exit process if connection fails
  }
};

// Start the server and establish database connection
ConnectDB();

require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const connectdb = require('./DataBase/connect');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const asyncHandler = require('./utils/asynchandler');
const { GraphQLScalarType, Kind } = require('graphql');
const session = require('express-session');
const OauthRouter = require('./Routes/Oauth2.router');
const passport = require('passport'); 

const gql = require('graphql-tag');


// Models
const Video = require('./Models/video.models');
const User = require('./Models/users.models');

// Routers
const UserRouter = require('./Routes/users.routers');
const VideoRouter = require('./Routes/videos.routers');
const TweetRouter = require('./Routes/tweets.routers');
const CommentRouter = require('./Routes/comments.routers');
const healthCheck = require('./Controllers/healthcheck.controllers');
const subscriptionRouter = require('./Routes/subscritption.routers');
const LikeRouter = require('./Routes/like.routers');
const PlaylistRouter = require('./Routes/playlist.routers');
const DashboardRouter = require('./Routes/dashboard.router');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(cookieParser());
app.use(cors());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Home Route
// app.get(
//   '/home',
//   asyncHandler(async (req, res) => {
//     const videos = await Video.find({ isPublished: true }).populate('owner'); // Assuming `owner` is a reference field
//     return res.render('home', { videos });
//   })
// );

app.use(session({
  secret: process.env.SECRETE,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
// API Routes
app.use('/api/v1/auth/user', UserRouter);
app.use('/api/v1/videos', VideoRouter);
app.use('/api/v1/tweets', TweetRouter);
app.use('/api/v1/comments', CommentRouter);
app.use('/api/v1/healthcheck', healthCheck);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/likes', LikeRouter);
app.use('/api/v1/playlists', PlaylistRouter);
app.use('/api/v1/dashboard', DashboardRouter);


app.use('/', OauthRouter); 




const typeDefs = gql`
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
    avatar:String!
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
      return new Date(value); // Converts client input (ISO string or timestamp) to JavaScript Date object
    },
    serialize(value) {
      return value instanceof Date ? value.toISOString() : null; // Converts Date object to ISO string for sending it back to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      return null;
    },
  }),

  // Resolvers for Video type
  Video: {
    owner: async (video) => {
      try {
        const user = await User.findById(video.owner);
        return user;
      } catch (error) {
        console.error('Error fetching owner:', error);
        throw new Error('Unable to fetch owner information');
      }
    },
  },

  Query: {
    getVideoInfo: async () => {
      try {
        const videos = await Video.find({ isPublished: true }).populate('owner');
        return videos;
      } catch (error) {
        console.error('Error fetching videos:', error);
        throw new Error('Unable to fetch video information');
      }
    },
    getUserById: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Unable to fetch user information');
      }
    },
  },
};

// Create Apollo Server outside the database connection
const server = new ApolloServer({ typeDefs, resolvers });



// Define your GraphQL query
(async () => {
    const { request } = await import('graphql-request');
  
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
  
    app.get('/home', async (req, res) => {
      try {
        const data = await request('http://localhost:5000/graphql', GET_VIDEOS_QUERY, {
            headers: {
              'Content-Type': 'application/json', // or 'application/graphql'
            }
            }); console.log('Data ', data);
        res.render('home', { videos: data.getVideoInfo });
      } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).send('Error fetching data');
      }
    });
  })();
  


// Database Connection and Server Initialization
const ConnectDB = async () => {
  try {
    await connectdb();
    await server.start();
    app.use('/graphql', expressMiddleware(server)); // Use Apollo Server middleware

    app.listen(port, () => {
      console.log(`Server is listening on port: ${port}`);
    });
  } catch (error) {
    console.error('Something Went Wrong!!', error);
    process.exit(1);
  }
};

// Start the server
ConnectDB();

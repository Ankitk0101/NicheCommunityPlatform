const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload'); 
const connectDb = require("./config/db");
const authRoutes = require("./routes/auth.route");
const communitRoute = require('./routes/community.route');
const postRoutes = require('./routes/post.route'); 
const commentRoutes = require('./routes/comments.route');  
const feedRoute = require("./routes/feed.routes")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,     
  tempFileDir: "/tmp/",   
  limits: { fileSize: 50 * 1024 * 1024 }
}));
app.use(express.json());
app.use(cookieParser());

 
const allowedOrigins = [
  "http://localhost:5173",
  "https://nichecommunityplatform-1.onrender.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


 
connectDb();

 
app.use("/auth", authRoutes);
app.use("/community", communitRoute);
app.use("/posts", postRoutes);  
app.use("/comments", commentRoutes);  
app.use("/feed",feedRoute)

 
app.get("/health", (req, res) => {
  res.status(200).json({ 
    message: "Server is running", 
    timestamp: new Date().toISOString() 
  });
});

 
app.use((req, res, next) => {
  req.io = io;
  next();
});

 
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinPost", (postId) => {
    socket.join(postId);
    console.log(`User joined post room: ${postId}`);
  });

  socket.on("joinCommunity", (communityId) => {
    socket.join(communityId);
    console.log(`User joined community room: ${communityId}`);
  });

  socket.on("newComment", (data) => {
    socket.to(data.postId).emit("newComment", data.comment);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

 
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

 
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
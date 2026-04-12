require("dotenv").config();

const { app } = require("./app");
const { connectDB } = require("./infrastructure/db/mongoose");

const PORT = process.env.PORT=3000 || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
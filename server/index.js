const express = require("express");
const cors = require("cors");
const survivalRoutes = require("./routes/survival");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    message: "Marooned server is running."
  });
});

app.get("/api/game", (req, res) => {
  res.json({
    title: "Marooned",
    subtitle: "Pick 3 items. Hope for the best."
  });
});

app.use("/api", survivalRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// BMI Calculator Endpoint
app.post('/bmi', (req, res) => {
  const { height, weight } = req.body;
  if (!height || !weight) return res.status(400).json({ error: "Height and weight required" });
  const bmi = weight / ((height / 100) ** 2);
  let status;
  if (bmi < 18.5) status = "underweight";
  else if (bmi < 25) status = "normal";
  else if (bmi < 30) status = "overweight";
  else status = "obese";
  res.json({ bmi: bmi.toFixed(2), status });
});

// YouTube videos API
app.post('/videos', async (req, res) => {
  const { query } = req.body;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=4&key=${process.env.YOUTUBE_API_KEY}`
    );
    const videoIds = response.data.items.map(item => item.id.videoId);
    res.json({ titles: videoIds });
  } catch {
    res.status(500).json({ error: "Failed to fetch YouTube videos" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

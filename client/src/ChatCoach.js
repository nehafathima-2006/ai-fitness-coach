import { useState } from "react";

const nutritionPlans = {
  underweight: {
    description: "Focus on calorie-dense foods to safely gain weight healthily.",
    ingredients: [
      "Whole grains like oats and brown rice",
      "Nut butters and nuts (almonds, walnuts)",
      "Avocados and healthy oils",
      "Full-fat dairy (milk, yogurt, cheese)",
      "Lean proteins (chicken, eggs, fish)",
      "Starchy vegetables (potatoes, corn)",
      "Smoothies with fruits and protein powder",
      "Energy bars and dried fruits",
      "Beans and legumes",
      "Seeds like chia and flaxseed"
    ],
    recipes: [
      "Peanut butter banana smoothie",
      "Avocado and egg toast",
      "Whole grain pasta in creamy sauce",
      "Oats bowl with mixed nuts",
      "Paneer stir fry with veggies"
    ]
  },
  normal: {
    description: "Balanced diet with lean proteins and whole foods to maintain health.",
    ingredients: [
      "Leafy greens and colorful vegetables",
      "Whole grains like quinoa and barley",
      "Fruits including berries and apples",
      "Lean proteins such as chicken, tofu, fish",
      "Legumes (lentils, beans, chickpeas)",
      "Low-fat dairy products",
      "Healthy fats (olive oil, avocado)",
      "Nuts and seeds",
      "Water and herbal teas",
      "Eggs and lean meat"
    ],
    recipes: [
      "Grilled chicken with roasted veggies",
      "Quinoa salad with chickpeas",
      "Vegetable lentil soup",
      "Oatmeal with fresh berries",
      "Boiled eggs and whole wheat wraps"
    ]
  },
  overweight: {
    description: "High fiber and protein with limited refined carbs and fats.",
    ingredients: [
      "Leafy greens like spinach and kale",
      "Cruciferous vegetables such as broccoli and cauliflower",
      "Berries and low glycemic fruits",
      "Whole grains like oats and barley",
      "Lean proteins (fish, chicken breast, tofu)",
      "Legumes and lentils",
      "Low-fat dairy",
      "Green tea and detox drinks",
      "Nuts in moderation",
      "Herbs and spices like turmeric and ginger"
    ],
    recipes: [
      "Green smoothie with spinach and kale",
      "Grilled fish with steamed broccoli",
      "Lentil and vegetable stir fry",
      "Oats upma with vegetables",
      "Roasted chickpea salad"
    ]
  },
  obese: {
    description: "Low calorie, high-fiber, nutrient-rich diet for sustainable weight loss.",
    ingredients: [
      "Non-starchy vegetables (broccoli, carrots, cucumbers)",
      "Whole fruits (apples, berries, oranges)",
      "Whole grains in moderation (millet, quinoa)",
      "Beans, peas, and pulses",
      "Lean protein (chicken breast, fish, eggs)",
      "Low-fat dairy (skim milk, yogurt)",
      "Healthy oils sparingly (olive oil)",
      "Green tea, lemon water",
      "Spices (turmeric, cinnamon)",
      "Soups and vegetable broths"
    ],
    recipes: [
      "Vegetable stew with lentils",
      "Quinoa and spinach salad",
      "Grilled chicken breast with roasted veggies",
      "Oats idli with sambar",
      "Sprout and vegetable salad"
    ]
  }
};

function YoutubeEmbed({ videoId }) {
  return (
    <iframe
      width="320"
      height="180"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="YouTube video"
      style={{ margin: "10px 0" }}
    />
  );
}

export default function ChatCoach() {
  const [category, setCategory] = useState("");
  const [messages, setMessages] = useState([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [input, setInput] = useState("");
  const [videoIds, setVideoIds] = useState([]);
  const [bmi, setBmi] = useState(null);
  const [bmiStatus, setBmiStatus] = useState("");

  async function fetchVideos(query) {
    try {
      const res = await fetch("http://localhost:3001/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      return data.titles || [];
    } catch {
      return [];
    }
  }

  function getBMIStatus(bmi) {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  }

  async function handleMessageSend(e) {
    e.preventDefault();
    if (!input) return;
    setMessages(msgs => [...msgs, { sender: "user", text: input }]);

    if (category === "bmi") {
      if (!height) {
        setHeight(input);
        setMessages(msgs => [...msgs, { sender: "bot", text: "Please enter your weight (kg):" }]);
        setInput("");
        return;
      }
      if (!weight) {
        setWeight(input);
        const heightVal = parseFloat(height) / 100;
        const weightVal = parseFloat(input);
        const bmiValue = weightVal / (heightVal * heightVal);
        const status = getBMIStatus(bmiValue);
        setBmi(bmiValue.toFixed(2));
        setBmiStatus(status);
        setMessages(msgs => [
          ...msgs,
          { sender: "bot", text: `Your BMI is ${bmiValue.toFixed(2)}. You are ${status}.` }
        ]);
        setInput("");
        return;
      }
    }

    if (category === "nutrition") {
      const status = bmiStatus || input.trim().toLowerCase();
      if (!nutritionPlans[status]) {
        setMessages(msgs => [
          ...msgs,
          { sender: "bot", text: "Enter valid BMI status: underweight, normal, overweight, or obese." }
        ]);
        setInput("");
        return;
      }
      const plan = nutritionPlans[status];
      const vids = await fetchVideos(status + " nutrition diet");

      setVideoIds(vids);
      setMessages(msgs => [
        ...msgs,
        { sender: "bot", text: plan.description },
        { sender: "bot", text: `Ingredients: ${plan.ingredients.join(", ")}` },
        { sender: "bot", text: `Recipes: ${plan.recipes.join(", ")}` },
        { sender: "bot", text: "Here are some nutrition videos:" }
      ]);
      setInput("");
      return;
    }

    if (category === "workout") {
      const choice = input.trim().toLowerCase();
      const vids = await fetchVideos(choice + " workout");
      setVideoIds(vids);
      setMessages(msgs => [...msgs, { sender: "bot", text: "Here are some workout videos:" }]);
      setInput("");
      return;
    }
    setInput("");
  }

  function handleCategorySelect(cat) {
    setCategory(cat);
    setMessages([]);
    setHeight("");
    setWeight("");
    setInput("");
    setVideoIds([]);
    if (cat === "bmi") {
      setMessages([{ sender: "bot", text: "Please enter your height (cm):" }]);
    } else if (cat === "nutrition") {
      setMessages([{ sender: "bot", text: "Please enter your BMI status or calculate BMI first (e.g., underweight, normal, overweight, obese):" }]);
    } else if (cat === "workout") {
      setMessages([{ sender: "bot", text: "What type of workout are you interested in? (e.g., cardio, strength, flexibility, burnout)" }]);
    }
  }

  const buttonStyle = {
    padding: "15px 30px",
    margin: "10px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  };

  const categories = [
    { label: "BMI Calculator", color: "#4CAF50", key: "bmi" },
    { label: "Nutrition Diet Planner", color: "#2196F3", key: "nutrition" },
    { label: "Workout/Burnout", color: "#FF9800", key: "workout" }
  ];

  return (
    <div style={{ textAlign: "center", padding: "1.5em", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2.5em", color: "#333", marginBottom: "1em" }}>AI Fitness Coach Chatbot</h1>

      <div>
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => handleCategorySelect(cat.key)}
            style={{ ...buttonStyle, backgroundColor: cat.color }}
            onMouseOver={e => (e.target.style.opacity = 0.9)}
            onMouseOut={e => (e.target.style.opacity = 1)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div
        style={{
          margin: "1.5em auto",
          width: "80%",
          maxWidth: "600px",
          minHeight: "250px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1em",
          backgroundColor: "#fafafa",
          textAlign: "left",
          overflowY: "auto"
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "8px 0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: msg.sender === "user" ? "#DCF8C6" : "#E8EAF6"
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {videoIds.length > 0 && videoIds.map((id, index) => <YoutubeEmbed videoId={id} key={index} />)}
      </div>

      {category !== "" && (
        <form onSubmit={handleMessageSend}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your reply..."
            style={{
              padding: "10px",
              width: "60%",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
              fontSize: "16px"
            }}
          />
          <button
            type="submit"
            style={{ ...buttonStyle, backgroundColor: "#673AB7", fontSize: "16px", padding: "10px 20px" }}
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}

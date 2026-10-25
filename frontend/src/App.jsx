
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/donations";

function App() {
  const [donations, setDonations] = useState([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    mealName: "",
    quantity: 1,
    location: "",
    expiryTime: "",
    donorName: "",
  });

  async function loadDonations() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load donations");
      setDonations(await response.json());
    } catch {
      setMessage("Cannot connect to ShareMeal backend. Check that it is running.");
    }
  }

  useEffect(() => {
    loadDonations();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function addDonation(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
          expiryTime: new Date(form.expiryTime).toISOString(),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not add donation");

      setMessage("Donation added successfully!");
      setForm({
        mealName: "",
        quantity: 1,
        location: "",
        expiryTime: "",
        donorName: "",
      });
      await loadDonations();
    } catch (error) {
      setMessage(error.message || "Could not add donation.");
    }
  }

  async function claimDonation(id) {
    try {
      const response = await fetch(`${API}/${id}/claim`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not claim donation");

      setMessage("Meal claimed successfully!");
      await loadDonations();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <div className="brand">🥗 ShareMeal</div>
        <h1>Good food. Shared with care.</h1>
        <p>Connect surplus meals with people who need them.</p>
        <a href="#donate" className="hero-button">Donate a meal</a>
      </header>

      <section id="donate" className="panel">
        <h2>Share a meal</h2>
        <p className="muted">Add food that someone else can enjoy.</p>

        <form onSubmit={addDonation} className="donation-form">
          <label>
            Meal name
            <input name="mealName" value={form.mealName} onChange={handleChange} placeholder="e.g. Vegetable rice" required />
          </label>

          <label>
            Number of portions
            <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required />
          </label>

          <label>
            Pickup location
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Kozhikode" required />
          </label>

          <label>
            Food expiry date and time
            <input name="expiryTime" type="datetime-local" value={form.expiryTime} onChange={handleChange} required />
          </label>

          <label>
            Donor name
            <input name="donorName" value={form.donorName} onChange={handleChange} placeholder="Your name or organization" required />
          </label>

          <button type="submit" className="primary-button">Publish donation</button>
        </form>

        {message && <p className="message" role="status">{message}</p>}
      </section>

      <section className="meals">
        <h2>Community meals</h2>
        <p className="muted">Browse donations and claim available portions.</p>

        {donations.length === 0 ? (
          <p className="empty">No donations yet. Be the first to share a meal!</p>
        ) : (
          <div className="meal-grid">
            {donations.map((donation) => (
              <article className="meal-card" key={donation._id}>
                <div className="meal-icon">🍲</div>
                <span className={`status ${donation.status === "Available" ? "available" : "claimed"}`}>
                  {donation.status}
                </span>
                <h3>{donation.mealName}</h3>
                <p>🍽️ {donation.quantity} portions</p>
                <p>📍 {donation.location}</p>
                <p>👤 {donation.donorName}</p>
                <p>⏰ Expires: {new Date(donation.expiryTime).toLocaleString()}</p>
                {donation.status === "Available" && (
                  <button className="claim-button" onClick={() => claimDonation(donation._id)}>
                    Claim meal
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>ShareMeal · Less waste, more care 💚</footer>
    </main>
  );
}

export default App;

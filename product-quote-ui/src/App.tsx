import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5217/api/quote";

type Quote = {
  productName: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

export default function App() {
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setQuote(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          price: Number(price),
          quantity: Number(quantity),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setQuote(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate quote.");
    }
  }

  return (
    <main>
      <h1>Product Quote Calculator</h1>
      <p>Orders of 10 or more receive a 10% discount.</p>

      <form onSubmit={handleSubmit}>
        <label>
          Product name
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </label>

        <label>
          Unit price
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </label>

        <label>
          Quantity
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </label>

        <button type="submit">Calculate quote</button>
      </form>

      {error && <p className="error">{error}</p>}

      {quote && (
        <section>
          <h2>Quote for {quote.productName}</h2>
          <p>Subtotal: ${quote.subtotal.toFixed(2)}</p>
          <p>Discount: ${quote.discount.toFixed(2)}</p>
          <p>Tax: ${quote.tax.toFixed(2)}</p>
          <h3>Total: ${quote.total.toFixed(2)}</h3>
        </section>
      )}
    </main>
  );
}
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:5217/api";
const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type Product = { id: number; name: string; price: number };
type Quote = { productName: string; productPrice: number; quantity: number; subtotal: number; discount: number; tax: number; total: number };

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProduct = products.find((product) => product.id === Number(productId));

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Unable to load the product catalog.");
        setProducts(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load the product catalog.");
      } finally {
        setIsLoadingProducts(false);
      }
    }
    void loadProducts();
  }, []);

  function clearQuote() {
    setProductId("");
    setQuantity("");
    setQuote(null);
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setQuote(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: Number(productId), quantity: Number(quantity) }),
      });
      if (!response.ok) throw new Error(await response.text());
      setQuote(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to calculate quote.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="quote-page">
      <section className="quote-card" aria-labelledby="page-title">
        <p className="eyebrow">Instant estimate</p>
        <h1 id="page-title">Product Quote Calculator</h1>
        <p className="intro">Choose an item from the catalog and quantity to see your order total. Orders of 10 or more receive a 10% discount.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Product
            <select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={isLoadingProducts} required>
              <option value="">{isLoadingProducts ? "Loading catalog..." : "Choose a product"}</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} - {currency.format(product.price)}</option>)}
            </select>
          </label>
          <div className="field-row">
            <label>
              Unit price
              <output className="price-display">{selectedProduct ? currency.format(selectedProduct.price) : "Select a product"}</output>
            </label>
            <label>
              Quantity
              <input type="number" min="1" step="1" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="1" required />
            </label>
          </div>
          <div className="quantity-shortcuts" aria-label="Quick quantity choices">
            <span>Quick quantity:</span>
            {[1, 10, 25].map((amount) => <button key={amount} type="button" onClick={() => setQuantity(String(amount))}>{amount}</button>)}
          </div>
          <button className="calculate-button" type="submit" disabled={isLoadingProducts || isSubmitting}>{isSubmitting ? "Calculating..." : "Calculate quote"}</button>
        </form>
        {error && <p className="message error" role="alert">{error}</p>}
        {quote && (
          <section className="quote-result" aria-live="polite" aria-labelledby="quote-title">
            <div className="result-heading"><div><p className="eyebrow">Your estimate</p><h2 id="quote-title">{quote.productName}</h2></div>
              <button className="reset-button" type="button" onClick={clearQuote}>New quote</button></div>
            <p className="unit-price">{currency.format(quote.productPrice)} each x {quote.quantity}</p>
            <dl>
              <div><dt>Subtotal</dt><dd>{currency.format(quote.subtotal)}</dd></div>
              <div className={quote.discount > 0 ? "savings" : ""}><dt>Bulk discount</dt><dd>-{currency.format(quote.discount)}</dd></div>
              <div><dt>Tax</dt><dd>{currency.format(quote.tax)}</dd></div>
              <div className="total"><dt>Total</dt><dd>{currency.format(quote.total)}</dd></div>
            </dl>
          </section>
        )}
      </section>
    </main>
  );
}

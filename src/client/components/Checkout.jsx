import React, { useState } from 'react';
import { useCart, useCartDispatch, cartSubtotal } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Simple checkout form – collects user data, shows order summary,
 * clears the cart on successful "submission" and displays a thank‑you message.
 */
export default function Checkout() {
  const { t } = useTranslation();
  const cart = useCart();
  const dispatch = useCartDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', address: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we would POST to /api/orders here.
    // For now we just clear the cart and show a confirmation.
    dispatch({ type: 'clear' });
    setSubmitted(true);
  };

  if (cart.length === 0 && !submitted) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">{t('cartEmpty')}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">{t('thankYou')}</h2>
        <p className="mb-2">{t('orderReceived')}</p>
        <p className="mb-4">{t('orderId')}: #{Math.floor(Math.random() * 1000000)}</p>
        <Link to="/" className="text-blue-600 hover:underline">
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">{t('checkout')}</h2>

      <section className="bg-white p-4 rounded shadow">
        <h3 className="font-medium mb-2">{t('orderSummary')}</h3>
        <ul className="divide-y divide-gray-200 mb-4">
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>{item.title} × {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-right font-bold">
          {t('total')}: ${cartSubtotal(cart).toFixed(2)}
        </p>
      </section>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block mb-1 font-medium">{t('name')}</label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t('address')}</label>
          <input
            type="text"
            name="address"
            required
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t('email')}</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {t('placeOrder')}
        </button>
      </form>
    </div>
  );
}

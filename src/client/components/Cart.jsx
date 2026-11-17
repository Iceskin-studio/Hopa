import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCart, useCartDispatch, cartSubtotal } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { t } = useTranslation();
  const cart = useCart();
  const dispatch = useCartDispatch();
  const navigate = useNavigate();

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    dispatch({ type: 'update', id, quantity: qty });
  };

  const removeItem = (id) => {
    dispatch({ type: 'remove', id });
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return <p className="text-center">{t('emptyCart')}</p>;
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center bg-white p-3 rounded shadow"
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-16 h-16 object-cover rounded mr-3"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm">{t('price')}: ${item.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(item.id, item.quantity - 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              –
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() => updateQty(item.id, item.quantity + 1)}
              className="px-2 py-1 bg-gray-200 rounded"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-3 text-red-600 hover:underline"
          >
            ✕
          </button>
        </div>
      ))}

      <div className="text-right font-bold text-xl">
        {t('total')}: ${cartSubtotal(cart).toFixed(2)}
      </div>

      <div className="flex justify-end gap-4">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          {t('storeName')}
        </Link>
        <button
          onClick={handleCheckout}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {t('checkout')}
        </button>
      </div>
    </div>
  );
}

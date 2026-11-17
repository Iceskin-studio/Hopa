import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCartDispatch } from "../context/CartContext";
import { Link } from "react-router-dom";

/**
 * Fetches product data from the backend and renders a searchable,
 * filterable product grid. Users can add items to the cart.
 */
export default function ProductList() {
  const { t } = useTranslation();
  const dispatch = useCartDispatch();

  const [products, setProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load products once
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProducts(json.data);
          setDisplayed(json.data);
        } else {
          setError(json.error || t("loadError"));
        }
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  // Apply search / category filters
  useEffect(() => {
    let filtered = products;
    if (category !== "all") {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }
    setDisplayed(filtered);
  }, [search, category, products]);

  const addToCart = (product) => {
    dispatch({
      type: "add",
      item: {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      },
    });
  };

  if (loading) return <p className="text-center">{t("loading")}</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  // Extract unique categories for filter dropdown
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  return (
    <div className="space-y-4">
      {/* Search & Category Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {displayed.length === 0 ? (
        <p className="text-center">{t("noProducts")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded shadow flex flex-col"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded mb-3"
                />
                <h3 className="font-semibold text-lg">{product.title}</h3>
              </Link>
              <p className="text-sm text-gray-600 flex-1">
                {product.description?.slice(0, 80)}...
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-bold">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t("addToCart")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

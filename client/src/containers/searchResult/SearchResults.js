import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./SearchResults.css";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:8082/product/search?query=${query}`,
        );
        const data = await res.json();
        setResults(data.data || []);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="search-page">
      <h2>
        Showing <span>{results.length} results</span> for "{query}"
      </h2>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : results.length === 0 ? (
        <div className="empty">Koi product nahi mila 😔</div>
      ) : (
        <div className="search-grid">
          {results.map((item) => (
            <div
              key={item._id}
              className="search-card"
              onClick={() => navigate(`/product/${item._id}`)}
            >
              <div className="card-img">
                <img src={item.images[0]} alt={item.name} />
              </div>
              <div className="card-info">
                <h4>{item.name}</h4>
                <p className="price">₹{item.price}</p>
                <p className="category">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;

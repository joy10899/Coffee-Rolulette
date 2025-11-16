// src/LeftPanel.js
import React from 'react';
import './LeftPanel.css'; 

function LeftPanel({ mapUrl, details }) {
  return (
    <div className="left-panel">
      
      {/* 1. MAP EMBED AREA */}
      <div className="map-container">
        {mapUrl ? (
          <iframe
            title="google-map"
            src={mapUrl} 
            width="100%"
            height="100%"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        ) : (
          <div className="placeholder">
            Search for a place to see the map here...
          </div>
        )}
      </div>
      
      {/* 2. REVIEWS AREA */}
      <div className="reviews-container">
        <h3>Location Details & Reviews</h3>
        {details ? (
          <>
            <h4>{details.name}</h4>
            <p><strong>Address:</strong> {details.formatted_address}</p>
            <p><strong>Rating:</strong> {details.rating || 'N/A'} / 5</p>
            <hr />
            {details.reviews && details.reviews.length > 0 ? (
              details.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <strong>{review.author_name}</strong> ({review.rating} stars)
                  <p>"{review.text}"</p>
                </div>
              ))
            ) : (
              <p>No reviews found for this location.</p>
            )}
          </>
        ) : (
          <p>Location details will appear here...</p>
        )}
      </div>
    </div>
  );
}
export default LeftPanel;
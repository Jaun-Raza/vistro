import React, { useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { useReviewsDataQuery, useRemoveReviewMutation, useAddReviewMutation } from '../RTK/ApiRequests';
import { InfoPopup } from '../components/InfoCard';

const Reviews = () => {
  const [page, setPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    reviewText: '',
  });

  const { data, isLoading, isError } = useReviewsDataQuery(page);
  const [removeReview] = useRemoveReviewMutation();
  const [addReview] = useAddReviewMutation();

  if (isLoading || isError) {
    return <Loader />;
  }

  function viewDetail(data) {
    setShowPopup(true);
    setReviewData(data);
  }

  function handleCreateReview() {
    setShowCreatePopup(true);
    setFormData({
      customerName: '',
      rating: 5,
      reviewText: '',
    });
  }

  // Handle form input changes
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rating' ? parseInt(value) : value
    });
  }

  function submitNewReview(e) {
    e.preventDefault();
    
    addReview(formData).then(response => {
      if (!response.error) {
        setShowCreatePopup(false);
        window.location.reload();
      } else {
        alert('Error creating review. Please try again.');
      }
    });
  
    setShowCreatePopup(false);
  }


  // Remove review
  function removeReviewFunc(reviewId) {
    removeReview({ reviewId }).then(response => {
      if (!response.error) {
       window.location.reload()
      } else {
        alert('Something went wrong, try again!');
      }
    });
    
  }

  if (isLoading || isError) {
    return <Loader />;
  }

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Wrapper>
      <div className="main">
        <h1>Customer Reviews</h1>
        <div className="head">
          <div className="cards">
            <div className="card" style={{ backgroundColor: '#434ce6', color: '#fff' }}>
              <h3>Total Reviews <i className='fa fa-star'></i></h3>
              <span>{data?.data?.fullLength} {data?.data?.fullLength > 1 ? 'Reviews' : 'Review'}</span>
            </div>
          </div>
          <button className="create-btn" onClick={handleCreateReview}>
            <i className="fa-solid fa-plus"></i> Add New Review
          </button>
        </div>
        <div className="table">
          <div className="pagination">
            <button
              onClick={() => setPage(page === 1 ? page : page - 1)}
              disabled={page === 1}
              style={{ cursor: page === 1 ? 'not-allowed' : 'pointer' }}
            >
              {'<'}
            </button>
            <span>
              Page {page} of {Math.ceil(data?.fullLength / 10)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === Math.ceil(data?.fullLength / 10)}
              style={{ cursor: page === Math.ceil(data?.fullLength / 10) ? 'not-allowed' : 'pointer' }}
            >
              {'>'}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                data?.data?.reviews?.map((review) => {
                  return <tr key={review.reviewId}>
                    <td>{review.author}</td>
                    <td className="rating-stars">{renderStars(review.rating)}</td>
                    <td>{review?.createdAt?.slice(0, 10)}</td>
                    <td>
                      <button className='detailsBtn' onClick={() => {
                        viewDetail({
                          customerName: review.author,
                          rating: review.rating,
                          reviewText: review.review,
                          submittedAt: review?.createdAt?.slice(0, 10)
                        });
                      }}>View</button>
                      <button className='removeBtn' onClick={() => removeReviewFunc(review.reviewId)}>Delete</button>
                    </td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <InfoPopup
          title="Review Details"
          data={reviewData}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        />
      )}

      {showCreatePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Add New Review</h2>
            <form onSubmit={submitNewReview}>
              <div className="form-group">
                <label>Customer Name:</label>
                <input 
                  type="text" 
                  name="customerName" 
                  value={formData.customerName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating:</label>
                <select 
                  name="rating" 
                  value={formData.rating} 
                  onChange={handleInputChange}
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div className="form-group">
                <label>Review:</label>
                <textarea 
                  name="reviewText" 
                  value={formData.reviewText} 
                  onChange={handleInputChange}
                  required
                  rows="4"
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowCreatePopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Wrapper>
  );
};

const Wrapper = styled.section`
  width: 80%;
  height: 100vh;

  hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .main {
    width: 100%;
    height: 100vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 600;
    padding: 10px 0px;
  }

  .head {
    display: flex;
    flex-direction: row;
    padding: 1rem;
    justify-content: space-between;
    align-items: center;

    .cards {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      flex-wrap: wrap;
      width: 50%;

      .card {
        width: 20rem;
        height: fit-content;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 3rem;
        background-color: #fffdfd;
        border-radius: 1rem;
        color: #000;
        box-shadow: 3px 2px 5px 2px gainsboro;
        
        h3 {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        span {
          font-size: 2rem;
          font-weight: bold;
        }
      }
    }

    .create-btn {
      padding: 1rem 1.5rem;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        background-color: #45a049;
      }
    }
  }

  .table {
    padding: 1rem;

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #fefefe;
    }

    th, td {
      padding: 8px;
      text-align: left;
      font-size: 1.5rem;

      .removeBtn, .editBtn, .detailsBtn {
        border: none;
        color: #fff;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 8px;
        cursor: pointer;
      }

      .removeBtn {
        background-color: #f44336;
      }

      .editBtn {
        background-color: #2196F3;
      }

      .detailsBtn {
        background-color: green;
      }
    }

    th {
      background-color: #f2f2f2;
    }
    
    .rating-stars {
      display: flex;
      align-items: center;
      
      .star {
        font-size: 1.8rem;
        color: #ccc;
        margin-right: 2px;
      }
      
      .filled {
        color: gold;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
    align-items: center;

    button {
      margin-left: 10px;
      padding: 5px 10px;
      cursor: pointer;
      border: none;
      color: rgb(67, 76, 230);
      font-weight: bold;
    }

    span {
      margin: 0 10px;
      font-size: 1.4rem;
    }
  }
  
  /* Popup Styles */
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .popup-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    
    h2 {
      margin-top: 0;
      margin-bottom: 2rem;
      font-size: 2rem;
      font-weight: bold;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      input, select, textarea {
        width: 100%;
        padding: 0.8rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1.4rem;
        text-transform: unset;
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      
      button {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 4px;
        color: white;
        font-size: 1.4rem;
        cursor: pointer;
      }
      
      .submit-btn {
        background-color: #4CAF50;
        
        &:hover {
          background-color: #45a049;
        }
      }
      
      .cancel-btn {
        background-color: #f44336;
        
        &:hover {
          background-color: #d32f2f;
        }
      }
    }
  }
`;

export default Reviews;
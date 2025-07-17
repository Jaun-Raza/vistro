import { useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { useOrdersDataQuery } from '../RTK/ApiRequests';
import { InfoPopup } from '../components/InfoCard';

const Orders = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useOrdersDataQuery(page);
  const [showPopup, setShowPopup] = useState(false);
  const [orderData, setOrderData] = useState({});

  if (isLoading) {
    return <Loader />;
  }

  const orders = data?.data?.orders || [];
  const totalOrders = data?.data?.fullLength || 0;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
  const personalLicenses = orders.filter(order => 
    order.items.some(item => item.licenseType === 'personal')
  ).length;
  const commercialLicenses = orders.filter(order => 
    order.items.some(item => item.licenseType === 'commercial')
  ).length;


  function viewOrderDetail(order) {
    setShowPopup(true);
    
    const formattedData = {
      "Order ID": order.orderId,
      "Email": order.email,
      "Products": order.items.map(item => item.name).join(", "),
      "License Types": [...new Set(order.items.map(item => item.licenseType))].join(", "),
      "Bundles": [...new Set(order.items.flatMap(item => item.bundles || []))].join(", "),
      "Subtotal": `£${order.subtotal.toFixed(2)}`,
      "Total": `£${order.total.toFixed(2)}`,
      "Payment Method": order.paymentMethod,
      "Status": order.status,
      "Order Date": new Date(order.createdAt).toLocaleDateString()
    };
    
    setOrderData(formattedData);
  }

  const getPrimaryProduct = (items) => {
    return items.length > 0 ? items[0].name : 'N/A';
  };

  const getPrimaryLicense = (items) => {
    return items.length > 0 ? items[0].licenseType : 'N/A';
  };

  return (
    <Wrapper>
      <div className="main">
        <h1>Order Management</h1>
        <div className="head">
          <div className="cards">
            <div className="card" style={{ backgroundColor: '#434ce6', color: '#fff' }}>
              <h3>Total Orders <i className='fa fa-shopping-cart'></i></h3>
              <span>{totalOrders} {totalOrders !== 1 ? 'Orders' : 'Order'}</span>
            </div>
            <div className="card" style={{ backgroundColor: '#2ecc71', color: '#fff' }}>
              <h3>Total Revenue <i className='fa-solid fa-dollar-sign'></i></h3>
              <span>£{totalRevenue}</span>
            </div>
            <div className="card" style={{ backgroundColor: '#e67e22', color: '#fff' }}>
              <h3>License Types <i className='fa fa-file-contract'></i></h3>
              <span>{personalLicenses} Personal / {commercialLicenses} Commercial</span>
            </div>
          </div>
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
              Page {page} of {Math.ceil(totalOrders / 10 || 0)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!isError ? page === Math.ceil(totalOrders / 10) : true}
              style={{ cursor: page === Math.ceil(totalOrders / 10) ? 'not-allowed' : 'pointer' }}
            >
              {'>'}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Primary Product</th>
                <th>License</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            {
              !isError ? (
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderId}</td>
                      <td>{order.email}</td>
                      <td>{getPrimaryProduct(order.items)}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        {getPrimaryLicense(order.items)}
                      </td>
                      <td>£{order.total.toFixed(2)}</td>
                      <td style={{ 
                        textTransform: 'capitalize',
                        color: order.status === 'completed' ? 'green' : 
                               order.status === 'pending' ? 'orange' : 'red'
                      }}>
                        {order.status}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className='detailsBtn' 
                          onClick={() => viewOrderDetail(order)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan="8">
                      <h3>{error?.data?.error || 'Failed to load orders'}</h3>
                    </td>
                  </tr>
                </tbody>
              )
            }
          </table>
        </div>
      </div>

      {showPopup && (
        <InfoPopup
          title="Order Details"
          data={orderData}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        />
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

    .cards {
      display: flex;
      flex-direction: row;
      gap: 2rem;
      flex-wrap: wrap;
      width: 100%;

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

      .removeBtn {
        border: none;
        color: #fff;
        background-color: red;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 2px;
        cursor: pointer;
      }

      .detailsBtn {
        border: none;
        color: #fff;
        background-color: green;
        padding: 0.5rem;
        border-radius: 0.5rem;
        margin-right: 8px;
        cursor: pointer;
      }
    }

    th {
      background-color: #f2f2f2;
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
`;

export default Orders;
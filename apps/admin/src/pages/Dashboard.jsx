import React from 'react'
import styled from 'styled-components';
import { useOwnerDashDataQuery } from '../RTK/ApiRequests';
import Loader from '../components/Loader';

const Dashboard = () => {

  const { data, isLoading, isError } = useOwnerDashDataQuery();

  if (isLoading || isError) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <h1>Total Analytics</h1>
      <div className="currentAnalytics">
        <div className="cards">
          <div className="card"><h3>Total Users <i className='fa fa-users'></i></h3><span>{data?.data?.currentTotalAnalytics?.totalUsers || 0} {(data?.data?.currentTotalAnalytics?.totalUsers || 0) > 1 ? 'Users' : 'User'}</span></div>
          <div className="card"><h3>Verified Users <i className='fa fa-user-check'></i></h3><span>{data?.data?.currentTotalAnalytics?.userIsVerified || 0} {(data?.data?.currentTotalAnalytics?.userIsVerified || 0) > 1 ? 'Users' : 'User'}</span></div>
          <div className="card"><h3>Most Purchased Product<i className='fa fa-shopping-cart'></i></h3><span>{data?.data?.currentTotalAnalytics?.mostPurchasedProduct || 'None'}</span></div>
          <div className="card"><h3>Users with Purchases <i className='fa fa-shopping-cart'></i></h3><span>{data?.data?.currentTotalAnalytics?.userWithPurchases || 0} {(data?.data?.currentTotalAnalytics?.userWithPurchases || 0) > 1 ? 'Users' : 'User'}</span></div>
          <div className="card"><h3>Total Products <i className='fa fa-box'></i></h3><span>{data?.data?.currentTotalAnalytics?.totalProductsUploaded || 0} {(data?.data?.currentTotalAnalytics?.totalProductsUploaded || 0) > 1 ? 'Products' : 'Product'}</span></div>
          <div className="card"><h3>Total Orders <i className='fa fa-receipt'></i></h3><span>{data?.data?.currentTotalAnalytics?.totalOrders || 0} {(data?.data?.currentTotalAnalytics?.totalOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>Total Revenue <i className='fa fa-dollar-sign'></i></h3><span>${data?.data?.currentTotalAnalytics?.totalRevenue?.toFixed(2) || 0}</span></div>
          <div className="card"><h3>Total Reviews <i className='fa fa-star'></i></h3><span>{data?.data?.currentTotalAnalytics?.totalReviews || 0} {(data?.data?.currentTotalAnalytics?.totalReviews || 0) > 1 ? 'Reviews' : 'Review'}</span></div>
          <div className="card"><h3>Contact Submissions <i className='fa fa-envelope'></i></h3><span>{data?.data?.currentTotalAnalytics?.totalContactSubmissions || 0} {(data?.data?.currentTotalAnalytics?.totalContactSubmissions || 0) > 1 ? 'Submissions' : 'Submission'}</span></div>
          <div className="card"><h3>Most Contact Reason<i className='fa fa-question'></i></h3><span>{data?.data?.currentTotalAnalytics?.mostContactReasonSubmission || 'None'}</span></div>
        </div>
      </div>
      <hr />
      <h1>Last Month Analytics</h1>
      <div className="currentAnalytics">
        <div className="cards" style={{ width: '100%' }}>
          <div className="card"><h3>New Users <i className='fa fa-users'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalUsers || 0} {(data?.data?.lastMonthAnalytics?.totalUsers || 0) > 1 ? 'Users' : 'User'}</span></div>
          <div className="card"><h3>Products Added <i className='fa fa-box'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalProductsUploaded || 0} {(data?.data?.lastMonthAnalytics?.totalProductsUploaded || 0) > 1 ? 'Products' : 'Product'}</span></div>
          <div className="card"><h3>Most Purchased Product<i className='fa fa-shopping-cart'></i></h3><span>{data?.data?.lastMonthAnalytics?.mostPurchasedProduct || 'None'}</span></div>
          <div className="card"><h3>Orders <i className='fa fa-receipt'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalOrders || 0} {(data?.data?.lastMonthAnalytics?.totalOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>Revenue <i className='fa fa-dollar-sign'></i></h3><span>${data?.data?.lastMonthAnalytics?.totalRevenue?.toFixed(2) || 0}</span></div>
          <div className="card"><h3>Stripe Orders <i className='fa fa-box'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalStripeOrders || 0} {(data?.data?.lastMonthAnalytics?.totalStripeOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>PayPal Orders <i className='fa fa-box'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalPayPalOrders || 0} {(data?.data?.lastMonthAnalytics?.totalPayPalOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>Reviews <i className='fa fa-star'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalReviews || 0} {(data?.data?.lastMonthAnalytics?.totalReviews || 0) > 1 ? 'Reviews' : 'Review'}</span></div>
          <div className="card"><h3>Contact Submissions <i className='fa fa-envelope'></i></h3><span>{data?.data?.lastMonthAnalytics?.totalContactSubmissions || 0} {(data?.data?.lastMonthAnalytics?.totalContactSubmissions || 0) > 1 ? 'Submissions' : 'Submission'}</span></div>
          <div className="card"><h3>Most Contact Reason<i className='fa fa-question'></i></h3><span>{data?.data?.lastMonthAnalytics?.mostContactReasonSubmission || 'None'}</span></div>

        </div>
      </div>
      <hr />
      <h1>Last Year Analytics</h1>
      <div className="currentAnalytics">
        <div className="cards" style={{ width: '100%' }}>
          <div className="card"><h3>New Users <i className='fa fa-users'></i></h3><span>{data?.data?.lastYearAnalytics?.totalUsers || 0} {(data?.data?.lastYearAnalytics?.totalUsers || 0) > 1 ? 'Users' : 'User'}</span></div>
          <div className="card"><h3>Products Added <i className='fa fa-box'></i></h3><span>{data?.data?.lastYearAnalytics?.totalProductsUploaded || 0} {(data?.data?.lastYearAnalytics?.totalProductsUploaded || 0) > 1 ? 'Products' : 'Product'}</span></div>
          <div className="card"><h3>Most Purchased Product<i className='fa fa-shopping-cart'></i></h3><span>{data?.data?.lastYearAnalytics?.mostPurchasedProduct || 'None'}</span></div>
          <div className="card"><h3>Orders <i className='fa fa-receipt'></i></h3><span>{data?.data?.lastYearAnalytics?.totalOrders || 0} {(data?.data?.lastYearAnalytics?.totalOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>Revenue <i className='fa fa-dollar-sign'></i></h3><span>${data?.data?.lastYearAnalytics?.totalRevenue?.toFixed(2) || 0}</span></div>
          <div className="card"><h3>Stripe Orders <i className='fa fa-box'></i></h3><span>{data?.data?.lastYearAnalytics?.totalStripeOrders || 0} {(data?.data?.lastYearAnalytics?.totalStripeOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>PayPal Orders <i className='fa fa-box'></i></h3><span>{data?.data?.lastYearAnalytics?.totalPayPalOrders || 0} {(data?.data?.lastYearAnalytics?.totalPayPalOrders || 0) > 1 ? 'Orders' : 'Order'}</span></div>
          <div className="card"><h3>Reviews <i className='fa fa-star'></i></h3><span>{data?.data?.lastYearAnalytics?.totalReviews || 0} {(data?.data?.lastYearAnalytics?.totalReviews || 0) > 1 ? 'Reviews' : 'Review'}</span></div>
          <div className="card"><h3>Contact Submissions <i className='fa fa-envelope'></i></h3><span>{data?.data?.lastYearAnalytics?.totalContactSubmissions || 0} {(data?.data?.lastYearAnalytics?.totalContactSubmissions || 0) > 1 ? 'Submissions' : 'Submission'}</span></div>
          <div className="card"><h3>Most Contact Reason<i className='fa fa-question'></i></h3><span>{data?.data?.lastYearAnalytics?.mostContactReasonSubmission || 'None'}</span></div>

        </div>
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.section`
  width: 80%;
  height: 100%;
  overflow-y: auto;

  hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 600;
    padding: 10px 0px;
   
  }

  .currentAnalytics {
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
        
          h3{
           
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
    .graph {
      padding: 5px;
      background-color: #fff;
      border-radius: 1rem;
      width: 50%;
     
      height: fit-content;
      box-shadow: 3px 2px 5px 2px gainsboro;
    }
  }
`;

export default Dashboard
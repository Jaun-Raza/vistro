import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from "react-router-dom";

const Sidebar = () => {

  const [params, setParams] = useState();

  useEffect(() => {
    setParams(window.location.pathname);
  }, [])

  return (
    <Wrapper style={{ width: "20%" }}>
      <div className="slidebar">
        <NavLink to="/">
          <button style={{ backgroundColor: params === '/' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/');
          }}>
            <i className='fa fa-bars'></i>DashBoard
          </button>
        </NavLink>
        <NavLink to="/products">
          <button style={{ backgroundColor: params === '/products' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/products');
          }}>
            <i className='fa fa-box' style={{ fontSize: '1.8rem' }}></i>Products
          </button>
        </NavLink>
        <NavLink to="/users">
          <button style={{ backgroundColor: params === '/users' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/users');
          }}>
            <i className='fa fa-users' style={{ fontSize: '1.8rem' }}></i>Users
          </button>
        </NavLink>
        <NavLink to="/contacts">
          <button style={{ backgroundColor: params === '/contacts' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/contacts');
          }}>
            <i className='fa fa-question' style={{ fontSize: '1.8rem' }}></i>Contacts
          </button>
        </NavLink>
        <NavLink to="/orders">
          <button style={{ backgroundColor: params === '/orders' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/orders');
          }}>
            <i className='fa fa-shopping-cart' style={{ fontSize: '1.8rem' }}></i>Orders
          </button>
        </NavLink>
        <NavLink to="/reviews">
          <button style={{ backgroundColor: params === '/reviews' ? '#434CE6' : '#010c0b' }} onClick={() => {
            setParams('/reviews');
          }}>
            <i className='fa fa-star' style={{ fontSize: '1.8rem' }}></i>Reviews
          </button>
        </NavLink>
      </div>
    </Wrapper>
  );
};

const Wrapper = styled.section`
    width: 20%;
    border: 1px solid;
    display: flex;
    flex-direction: column;
    background-color: #010c0b;
    transition: all 0.5s ease-in-out 0s;

    .slidebar {
      padding: 1rem;
      padding-top: 3rem;
        button {
          width: 100%;
          height: 7rem;
          font-size: 2rem;
          color: white;
          background-color: #010c0b;
          border: none;
          text-align: justify;
          padding: 1rem;
          font-family: math;
          cursor: pointer;
          border-radius: 1rem;
         
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          &:hover { 
            opacity: 0.5;
          } 

          i {
            font-size: 2.4rem;
            padding-right: 1rem;
          }
        }

      i {
        font-size: 4rem;
      }
    }
`;

export default Sidebar

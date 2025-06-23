import React, { useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { useUsersDataQuery, useRemoveUserMutation } from '../RTK/ApiRequests';
import { InfoPopup } from '../components/InfoCard';
import ConfirmationAlert from '../components/ConfirmationAlert';

const Users = () => {

  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useUsersDataQuery(page);
  const [showPopup, setShowPopup] = useState(false);
  const [userData, setUserData] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);

  const [removeUser] = useRemoveUserMutation();

  if (isLoading) {
    return <Loader />;
  }

  async function handleRemoveUser() {
    if (!userToRemove) return;
    
    const res = await removeUser({ email: userToRemove.email });

   if (!res.success) {
      window.location.reload();
    } else {
      alert('Something went wrong, try again!');
    }
  }

  function confirmRemoveUser(id, email) {
    setUserToRemove({ id, email });
    setShowConfirmation(true);
  }

  function viewDetail(data) {
    setShowPopup(true);
    setUserData(data);
  }

  return (
    <Wrapper>
      <div className="main"> 
        <h1>Total Users</h1>
        <div className="head">
          <div className="cards">
            <div className="card" style={{ backgroundColor: '#434ce6', color: '#fff' }}><h3>Total Users <i className='fa fa-user'></i></h3><span>{!data?.data?.fullLength ? 0 : data?.data?.fullLength} {data?.data?.fullLength > 1 ? 'Users' : 'User'}</span></div>
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
              Page {page} of {Math.ceil(data?.data?.fullLength / 10 || 0)}
            </span>
            <button
              onClick={() =>
                setPage(page + 1)
              }
              disabled={!isError ? page === Math.ceil(data?.data?.fullLength / 10) : true}
              style={{ cursor: page === Math.ceil(data?.data?.fullLength / 20) ? 'not-allowed' : 'pointer' }}
            >
              {'>'}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Country</th>
                <th>Verified</th>
                <th>Registered At</th>
                <th>Actions</th>
              </tr>
            </thead>
            {
              !isError ? <><tbody>
              {
                data?.data?.users.map((currElem) => {
                  return <tr>
                    <td>{currElem.username}</td>
                    <td>{currElem.email}</td>
                    <td>{currElem.country}</td>
                    <td>{currElem.isVerified ? 'Yes' : 'No'}</td>
                    <td>{currElem.createdAt.slice(0, 10)}</td>
                    <td><button className='detailsBtn' onClick={() => {
                      viewDetail({
                        email: currElem?.email,
                        username: currElem?.username,
                        gender: currElem?.gender,
                        country: currElem?.country,
                        DOB: `${currElem?.day}/${currElem.month}/${currElem.year}`,
                        "discord Id": currElem.discordUserId,
                        purchased: `${currElem.totalPruchased} Purchased`,
                        "Agreed To Terms": currElem.agreeToTerms ? 'Yes' : "No"
                      })
                    }}>Details</button>
                      <button className='removeBtn' onClick={() => {
                        confirmRemoveUser(currElem.id, currElem.email)
                      }}>Remove</button>
                    </td>
                  </tr>
                })
              }
            </tbody></> : <><h3>{error?.data?.error}</h3></>
            }
          </table>
        </div>
      </div>

      {showPopup && (
        <InfoPopup
          title="User Information"
          data={userData}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        />
      )}

      <ConfirmationAlert
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleRemoveUser}
        title="Remove User"
        message={`Are you sure you want to remove the user with email: ${userToRemove?.email}? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </Wrapper>
  )
}

const Wrapper = styled.section`
width: 80%;
height: 100vh;

  hr {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  .main {
    width: 100%;height: 100vh;
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
        margin-right: 2px;
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

export default Users;
import { useState } from 'react';
import styled from 'styled-components';
import Loader from '../components/Loader';
import { useContactsDataQuery } from '../RTK/ApiRequests';
import { InfoPopup } from '../components/InfoCard';

const Contacts = () => {

  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error } = useContactsDataQuery(page);
  const [showPopup, setShowPopup] = useState(false);
  const [contactData, setContactData] = useState({})

  if (isLoading) {
    return <Loader />;
  }

  function viewDetail(data) {
    setShowPopup(true);
    setContactData(data);
  }

  return (
    <Wrapper>
      <div className="main">
        <h1>Total Contacts Submissions</h1>
        <div className="head">
          <div className="cards">
            <div className="card" style={{ backgroundColor: '#434ce6', color: '#fff' }}><h3>Total Contacts <i className='fa-solid fa-question'></i></h3><span>{!data?.data?.fullLength ? 0 : data?.data?.fullLength} {data?.data?.fullLength > 1 ? 'Contacts' : 'Contact'}</span></div>
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
              disabled={page === Math.ceil(data?.data?.fullLength / 10)}
              style={{ cursor: page === Math.ceil(data?.data?.fullLength / 10) ? 'not-allowed' : 'pointer' }}
            >
              {'>'}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Contact Reason</th>
                <th>SubmittedAt</th>
                <th>Actions</th>
              </tr>
            </thead>
            {
              !isError ? <><tbody>
                {
                  data?.data?.contacts?.map((currElem) => {
                    return <tr>
                      <td>{currElem.firstName}</td>
                      <td>{currElem.contactReason}</td>
                      <td>{currElem.createdAt.slice(0, 10)}</td>
                      <td><button className='detailsBtn' onClick={() => {
                        viewDetail({
                          "first Name": currElem.firstName,
                          email: currElem?.email,
                          "contact Reason": currElem?.contactReason,
                          message: currElem?.message,
                          "submitted At": currElem?.createdAt?.slice(0, 10)
                        })
                      }}>Details</button>
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
          data={contactData}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
        />
      )}
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

export default Contacts

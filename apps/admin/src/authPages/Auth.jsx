import { useState } from 'react'
import styled from "styled-components";
import Cookies from 'js-cookie'

const Auth = () => {

  const pass = import.meta.env.VITE_ADMIN_PASS

  const [password, setPass] = useState('')
  const [err, setErr] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setPass(e.target.value)
  }

  const login = () => {
    if (password === pass) {
      setIsLoading(true)
      Cookies.set('a-XYTUYAS-d-68743LAJSDa%$^$^@#-m,asd-in', 'gi_conn')
      window.location.href = '/'
    } else {
      setErr('Password is incorrect')
    }
  
  }

  return (
    <>
      <Wrapper>
        <div className="main">
          <div className="info"> 
            <h1>Vistro.shop <span>Admin Panel</span></h1>
          </div>
          <div className="form">
            <label htmlFor="password">Password</label>
            <input type="password" name='password' placeholder='password' id='password' value={password} onChange={handleChange} />
            <p style={{ color: 'red' }}>{err}</p>
            <button onClick={login}>{isLoading ? 'Loading...' : 'Log In'}</button>
          </div>
        </div>
      </Wrapper>
    </>
  )
}

const Wrapper = styled.section`
  width: 80%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
 
  .main {
    width: 40%; 
    height: fit-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 6rem;
    margin-top: -15rem;

    .info {
      h1 {
        font-weight: 500;
        font-family: sans-serif;
        padding-bottom: 5rem;
       
        display: flex;
        flex-direction: column;

      span {
        text-align: right;
        font-size: 14px;
        color: #434ce6;
        font-weight: 600;
        }
      }
    }

    .form {
      display: flex;
      flex-direction: column;
      align-items: baseline;
      gap: 1rem;
      width: 100%;
      padding: 1rem;
     

      label {
        font-size: 2rem;
        color: #434ce6;
       
      }

      input {
        text-transform: unset;
        border: 1px solid #434ce6;
        border-radius: 0.5rem;
        width: 100%;
        max-width: 100%;
        font-size: 1.6rem;
       
      }

      button {
        background-color: #434ce6;
        color: white;
        width: 100%;
        padding: 1rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 2rem;
        cursor: pointer;
      }
    }
  }


  @media (max-width: ${({ theme }) => theme.media.tab}) {
    .main {
      width: 80%;
    }
  }

  @media (max-width: ${({ theme }) => theme.media.mobile}) {
    .main {
      width: 100%;
    }
  }
`;

export default Auth
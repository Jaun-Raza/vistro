import { NavLink } from 'react-router-dom';
import styled from 'styled-components'


const Header = () => {

    return (
        <Wrapper>
            <div className="nav">
                <div className="logo">
                    <NavLink to={'/'}><h3>Vistro.shop - Admin Panel</h3></NavLink>
                </div>
            </div>
        </Wrapper>
    )
}

const Wrapper = styled.section`
    .nav {
        width: 100%;
        display: flex; 
        flex-direction: row;
        justify-content: space-between;
        background-color: #434ce6;
        padding: 1.5rem;
        align-items: center;   
    } 

    .logo {
        display: flex;
        gap: 2rem;
        align-items: center;

        h3 {
            font-size: 2rem;
            color: white;
            font-family: Open Sans;
        }
    }

    .user-profile {

        .user-info {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1rem;
            font-size: 2rem;

            img {
                border: 1px solid;
                border-radius: 22px;
            }

            h4 {
                color: white;
                font-family: Open Sans;
            }
        }

        button {
            width: 9rem;
            height: 4rem;
            background-color: #45bd45;
            outline: none;
            border: none;
            color: beige;
            border-radius: 4px;
            font-size: 13px;
            font-family: Rubik, sans-serif;
            font-weight: bold;
            cursor: pointer;
        }
    }
`;

export default Header
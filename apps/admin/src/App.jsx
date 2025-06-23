import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components'
import GlobalStyle from './GlobalStyle'
import Auth from './authPages/Auth';
import Dashboard from "./pages/Dashboard"
import Cookies from 'js-cookie';
import Header from './pages/Header';
import Sidebar from './components/Sidebar';
import Users from './pages/Users';
import Products from './pages/Products';
import Contacts from './pages/Contacts';
import Reviews from './pages/Reviews';
import Orders from './pages/Orders';

const App = () => {
  
  const tokAuth = Cookies.get('a-XYTUYAS-d-68743LAJSDa%$^$^@#-m,asd-in')

  const theme = {
    colors: {
      heading: "rgb(24 24 29)",
      text: "rgba(29 ,29, 29, .8)",
      white: "#fff",
      black: " #212529",
      helper: "#8490ff",

      bg: "#F6F8FA",
      footer_bg: "#0a1435",
      btn: "rgb(98 84 243)",
      border: "rgba(98, 84, 243, 0.5)",
      hr: "#ffffff",
      gradient:
        "linear-gradient(0deg, rgb(132 144 255) 0%, rgb(98 189 252) 100%)",
      shadow:
        "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;",
      shadowSupport: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
    },
    media: {
      mobile: "768px",
      tab: "998px",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <GlobalStyle />
        <Header />
        <div className="main" style={{ display: "flex", flexDirection: "row", gap: "1rem", height: "100vh" }}>
          <Sidebar />
          <Routes>
            <Route path='/' element={tokAuth ? <Dashboard /> : <Auth />} />
            <Route path='/auth' element={tokAuth ? <Dashboard /> : <Auth />} />
            <Route path="/products" element={tokAuth ? <Products /> : <Auth />} />
            <Route path="/users" element={tokAuth ? <Users /> : <Auth />} />
            <Route path="/contacts" element={tokAuth ? <Contacts /> : <Auth />} />
            <Route path="/orders" element={tokAuth ? <Orders /> : <Auth />} />
            <Route path="/reviews" element={tokAuth ? <Reviews /> : <Auth />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App

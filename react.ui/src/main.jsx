import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={{
      token: {
        colorText: "white"
      },
      components: {
        Input: {
          colorText: "black",
          hoverBorderColor: "#5bae71",
          activeBorderColor: "#5bae71",
        }
      }
    }}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)

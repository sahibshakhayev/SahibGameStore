import { Link } from "react-router-dom"
import { Flex, Typography, Input } from 'antd'
import mainLogo from '/mainLogo.svg'
import cartIcon from '/cartIcon.svg'
import cartIconHover from '/cartIconHover.svg'
import { useState } from "react";

const { Search } = Input;

function Header() {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <header>
        <Flex justify='space-between'>
          <Link to='/'><Flex gap='40px'>
            <img alt="logo" src={mainLogo} className="main-logo"/>
            <Typography.Title>Game Store</Typography.Title>
          </Flex></Link>
          <Flex gap='20px' className="nav-flex">
            <Search placeholder="input search text" allowClear className="nav-search" style={{ width: 200 }} />
            <Link to='/cart'><Flex gap='5px' onMouseEnter={() => { setIsHovered(true); }} onMouseLeave={() => { setIsHovered(false); }}>
              <img alt="cart" src={isHovered ? cartIconHover : cartIcon} className="cart-icon"/><Typography.Text className='nav-text' style={{color: (isHovered ? '#2f9dbe' : 'white')}}>Cart</Typography.Text>
            </Flex></Link>
            <Link to='/admin'><Typography.Text className='nav-text'>Admin</Typography.Text></Link>
          </Flex>
        </Flex>
      </header>
    )
  }
  
export default Header
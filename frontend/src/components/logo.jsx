import React from "react";
import Icon from '../assets/icon.png'
//CSS
import './logo.css'

function Logo() {
    return (
      <div className="logo">
        <div className="logo-icon">
            <img src={Icon} alt="Stepify logo" />
        </div>
      </div>
    );
  }
  
  export default Logo;
  
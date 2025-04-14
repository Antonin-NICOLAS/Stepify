import React from "react"
import {Button} from "antd"
import {HiOutlineSun, HiOutlineMoon} from "react-icons/hi"
//CSS
import "./toggletheme.css"

function ToggleTheme({ChangeTheme, darkTheme}) {
    return (
        <>
        <div className="toggle-theme-button">
            <Button onClick={ChangeTheme} className="toggle">
                {darkTheme ? <HiOutlineMoon/> : <HiOutlineSun/>}
            </Button>
        </div>
        </>
    );
}

export default ToggleTheme;

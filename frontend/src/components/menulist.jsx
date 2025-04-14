import { Menu } from "antd";
import { HomeOutlined, GoldOutlined, AppstoreOutlined, GatewayOutlined, QuestionOutlined, SettingOutlined } from "@ant-design/icons";
//CSS
import "./menulist.css"

function MenuList() {
    return (
        <>
            <Menu className="Menubar">
                <Menu.Item key="home" icon={<HomeOutlined />}>Accueil</Menu.Item>
                <Menu.Item key="ranking" icon={<GoldOutlined />}>Classement</Menu.Item>
                <Menu.Item key="activities" icon={<AppstoreOutlined />}>Activités</Menu.Item>
                <Menu.Item key="challenges" icon={<GatewayOutlined />}>Challenges</Menu.Item>
                <Menu.Item key="about" icon={<QuestionOutlined />}>À propos</Menu.Item>
                <Menu.SubMenu key="myaccount" title="Mon compte" icon={<SettingOutlined />}>
                    <Menu.Item key="settings">Réglages</Menu.Item>
                    <Menu.Item key="logout">Se déconnecter</Menu.Item>
                </Menu.SubMenu>
            </Menu>
        </>
    );
}

export default MenuList;

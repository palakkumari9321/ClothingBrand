import About from "../containers/about/About";
import EditProfile from "../containers/editprofile/EditProfile";
import Login from "../containers/login/Login";
import Register from "../containers/register/Register";
import ChangePassword from "../containers/changepassword/ChangePassword";
import Support from "../containers/suppport/Support";
import Contact from "../containers/contact/Contact";
import Home from "../containers/user/Home";

const ROUTES = {
  about: {
    name: "/about",
    component: <About />,
  },
  contact: {
    name: "/contact",
    component: <Contact />,
  },
  support: {
    name: "/support",
    component: <Support />,
  },
  editprofile: {
    name: "/editprofile",
    component: <EditProfile />,
  },
  home: {
    name: "/home",
    component: <Home />,
  },
  login: {
    name: "/login",
    component: <Login />,
  },
  register: {
    name: "/register",
    component: <Register />,
  },
  changepassword: {
    name: "/changepassword",
    component: <ChangePassword />,
  },
};
export default ROUTES;

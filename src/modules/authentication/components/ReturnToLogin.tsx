import { Link } from "react-router-dom";
import "./ReturnToLogin.scss";

const ReturnToLogin = () => (
  <Link className="returnToLoginContainer_returnToLoginLink" to="/login">
    <p>Return to Login</p>
  </Link>
);

export default ReturnToLogin;

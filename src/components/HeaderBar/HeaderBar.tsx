import logoWhite from '../../logo-white.png';
import styles from "./HeaderBar.module.css";
import { AccountSelector } from "../AccountSelector";

export const HeaderBar = () => {
  return (
    <header class={styles.header}>
      <img src={logoWhite} class={styles.logo} alt="logo" />
      <AccountSelector />
    </header>
  );
}

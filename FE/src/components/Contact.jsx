import React from "react";
import styles from "../styles/Contact.module.css";

const Contact = () => {
  return (
    <div className={styles.contactWrapper}>
      <div className={styles.contactBox}>
        <h2 className={styles.title}>Contact Us</h2>
        <p className={styles.text}>
          For any inquiries or support, please contact us via:
        </p>

        <div className={styles.infoSection}>
          <p>
            📧 <strong>Email:</strong>{" "}
            <a href="mailto:OpenSkys@gmail.com">OpenSkys@gmail.com</a>
          </p>
          <p>
            💬 <strong>WhatsApp:</strong>{" "}
            <a
              href="https://wa.me/972546341234"
              target="_blank"
              rel="noopener noreferrer"
            >
              +972-54-634-1234
            </a>
          </p>
        </div>

        <p className={styles.footerText}>
          Our team will respond as soon as possible during business hours.
        </p>
      </div>
    </div>
  );
};

export default Contact;

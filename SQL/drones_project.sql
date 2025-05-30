-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: מרץ 01, 2025 בזמן 10:05 AM
-- גרסת שרת: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `drones_project`
--

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `contact`
--

INSERT INTO `contact` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'בר', 'barpahima33@gmail.com', 'חרא אתר', '2025-02-17 16:37:36'),
(2, 'Ilia', 'iliaharom14@gmail.com', 'צריך להכניס לכלא את מי שבנה את האתר הזה !!', '2025-02-17 16:41:32'),
(3, 'Ilia', 'iliaharom14@gmail.com', 'חרא אתר', '2025-02-17 17:05:54'),
(4, 'avidan', 'barpahima33@gmail.com', 'כל המנהלים לכלא', '2025-02-17 17:16:20');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `drones`
--

CREATE TABLE `drones` (
  `id` int(11) NOT NULL,
  `model` varchar(100) NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `range_km` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `drones`
--

INSERT INTO `drones` (`id`, `model`, `weight`, `range_km`) VALUES
(1, 'DJI Phantom 4', 1.38, 10),
(2, 'Parrot Anafi', 0.32, 4),
(3, 'Mavic Air 2', 0.57, 18),
(4, 'Skydio 2', 0.77, 10),
(5, 'Autel EVO II', 1.15, 25);

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `missions`
--

CREATE TABLE `missions` (
  `id` int(11) NOT NULL,
  `drone_id` int(11) NOT NULL,
  `mission_name` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `missions`
--

INSERT INTO `missions` (`id`, `drone_id`, `mission_name`, `location`) VALUES
(1, 1, 'Surveillance', 'Tel Aviv'),
(2, 2, 'Photography', 'Haifa'),
(3, 3, 'Delivery', 'Jerusalem'),
(4, 4, 'Mapping', 'Eilat'),
(5, 5, 'Inspection', 'Beer Sheva');

-- --------------------------------------------------------

--
-- מבנה טבלה עבור טבלה `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `id_number` varchar(9) NOT NULL,
  `phone_number` varchar(10) NOT NULL,
  `age` int(11) NOT NULL,
  `birth_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- הוצאת מידע עבור טבלה `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `first_name`, `last_name`, `email`, `id_number`, `phone_number`, `age`, `birth_date`) VALUES
(1, 'admin', '$2b$10$eImiTXuWVxfM37uY4JANjQ3/bUjN8FjE3Zf/UjNz.Q1lL4G.Oc6mC', 'admin', '', '', '', '', '', 0, NULL),
(2, 'user1', '$2b$10$7YJ7HjFE9Qy2OMOVP3XfX.OH7upYrHq0AnuhH5XJl5IHzF/SCcTA2', 'user', '', '', '', '', '', 0, NULL),
(3, 'user2', '$2b$10$MT3HZ5J7RtVqA3ZOU1Z5Cul9A8Sf5UYT7FxKv9Gd1AsoW6QHQO.UW', 'user', '', '', '', '', '', 0, NULL),
(4, 'user3', '$2b$10$J3XJF7AORz/UX/8QV/HhS.9x.F7sz9uLR/U2FxSYHqZZa/Y7UkkmC', 'user', '', '', '', '', '', 0, NULL),
(5, 'user4', '$2b$10$L4UOVz39hXfHtF5vO7hjU.yOJLOphU3JLp5f/3Q7OP5OU1vI8p5qm', 'user', '', '', '', '', '', 0, NULL),
(6, 'newuser', '$2b$10$s0vzHVtb0d063u5At/Fuv.dp8KmCn4GQq7XlQjViE7tzW/.WLwz6K', 'user', '', '', '', '', '', 0, NULL),
(7, 'newuserbar', '$2b$10$o5VBWWdE7XjmjNKINEwgW.8ApLhL6x/2bhqvpexLkH6dJui/kQ1qK', 'user', '', '', '', '', '', 0, NULL),
(8, 'barpahima', '$2b$10$MMKc.3bOkH0ibS3W/U0Wtudi.50mJJz5m9z1MPKdeeCi5f1MEXXiC', 'user', '', '', '', '', '', 0, NULL),
(9, 'ilia', '$2b$10$LU6opm93oOG9oKt6iMCwWOv2XICw30YhChe4cA9ALVVtLSrqJeuva', 'user', '', '', '', '', '', 0, NULL),
(10, 'barpahima1', '$2b$10$xbHcYoref3Vop2gh7eCJFerKwQZ5efvQhHKFXPLU6.dyqA4/u7UZm', 'user', '', '', '', '', '', 0, NULL),
(11, 'testuser', '$2b$10$h8SzYiO/BxDHJMVvTXE8Ue1RZ/Xwg1X4Bh7B/gaiYspn45KExZPSm', 'user', '', '', '', '', '', 0, NULL),
(12, 'tzlilll', '$2b$10$z/TEUw.uZwHosFAZXQdvs.7AwBYvr1A4qOIw23VnPNo/8PxA.Pqba', 'user', '', '', '', '', '', 0, NULL),
(13, 'Bar Pahima', '$2b$10$9HnvHXF96YgkX6EeNY6LHeghAYzOX12DWtvLi5sfz47X8y.6RTwvm', 'user', '', '', '', '', '', 0, NULL),
(14, 'aann', '$2b$10$ILDKI3143zjgbXae3guB9.OD1Ee.TkADsXjux9jgPakaRyygmZ3Om', 'user', '', '', '', '', '', 0, NULL),
(15, 'test', '$2b$10$NaOFtKVpdktz/faZZlSHwe5ZxY/V5kkygqTs8hLEbGnFsYRwXc5.i', 'user', '', '', '', '', '', 0, NULL),
(16, 'bartest', '$2b$10$MHgWKKYOlmebPc9dCeOFIOucR4CaQlC8T0KaQMWA5dqgdMDvsbXfe', 'user', '', '', '', '', '', 0, NULL),
(17, 'mmm', '$2b$10$r4N5behi3HTULXSC5T6RHeTltFEtvrb50rsORQEWCSLYNN/I4PrkC', 'user', '', '', '', '', '', 0, NULL),
(18, 'bbb', '$2b$10$qXqA9YChbyfEZu20YJtXBe44avfECuPHBD3rqJPWx6wq8ot6MuV4O', 'user', '', '', '', '', '', 0, NULL),
(19, 'sss', '$2b$10$FFDmvEKmBXsuTlLxP/oH4uggWyEEdb7AeitqP327pb4cT194Ul/l2', 'user', '', '', '', '', '', 0, NULL),
(20, 'ilia123', '$2b$10$XZY1xf46s8lfXU62cXiN4uJ9iuZOchACWzLtm3Co79B7OxS78hFiu', 'user', '', '', '', '', '', 0, NULL),
(21, 'hhhh', '$2b$10$CcbtPHO3vcmo.I28BJz6neql8OfwFY8/Ip7UeUiX0JAGFh4Z1LVNa', 'user', '', '', '', '', '', 0, NULL),
(22, 'avidan', '$2b$10$7ZRSytXkUCZzu9aa4L1jGekWxy2KDMVI6W0SfoCSEr/qs/dnLR2Du', 'user', '', '', '', '', '', 0, NULL),
(23, 'barP', '$2b$10$jvQllJLvOodZZBUXQyqFB.rKIVDqfpduPwLbCT/6wBQm1HN3N5S46', 'user', 'barP6', 'pahima', 'barpahima33@gmail.com', '316555552', '3333333300', 22, '2025-02-17');

--
-- Indexes for dumped tables
--

--
-- אינדקסים לטבלה `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `drones`
--
ALTER TABLE `drones`
  ADD PRIMARY KEY (`id`);

--
-- אינדקסים לטבלה `missions`
--
ALTER TABLE `missions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `drone_id` (`drone_id`);

--
-- אינדקסים לטבלה `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `drones`
--
ALTER TABLE `drones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `missions`
--
ALTER TABLE `missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- הגבלות לטבלאות שהוצאו
--

--
-- הגבלות לטבלה `missions`
--
ALTER TABLE `missions`
  ADD CONSTRAINT `missions_ibfk_1` FOREIGN KEY (`drone_id`) REFERENCES `drones` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

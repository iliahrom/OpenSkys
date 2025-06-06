-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 30, 2025 at 12:22 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

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
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`id`, `name`, `email`, `message`, `created_at`) VALUES
(1, 'בר', 'barpahima33@gmail.com', 'חרא אתר', '2025-02-17 16:37:36'),
(2, 'Ilia', 'iliaharom14@gmail.com', 'צריך להכניס לכלא את מי שבנה את האתר הזה !!', '2025-02-17 16:41:32'),
(3, 'Ilia', 'iliaharom14@gmail.com', 'חרא אתר', '2025-02-17 17:05:54'),
(4, 'avidan', 'barpahima33@gmail.com', 'כל המנהלים לכלא', '2025-02-17 17:16:20');

-- --------------------------------------------------------

--
-- Table structure for table `drones`
--

CREATE TABLE `drones` (
  `id` int(2) NOT NULL,
  `model` varchar(15) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `range_km` double DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drones`
--

INSERT INTO `drones` (`id`, `model`, `weight`, `range_km`, `description`) VALUES
(2, 'Dji Tello', 0.32, 0.1, 'Lightweight drone with HDR video for programming.'),
(3, 'Autel Evo II', 1.19, 40, 'A professional-grade drone with an 8K camera and AI tracking.'),
(4, 'DJI Inspire 2', 3.44, 27, 'High-end drone for cinematic filmmaking with dual battery system.'),
(17, 'test234', 1, 1, '123123123');

-- --------------------------------------------------------

--
-- Table structure for table `flight_points`
--

CREATE TABLE `flight_points` (
  `label` varchar(10) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `missions`
--

CREATE TABLE `missions` (
  `id` int(11) NOT NULL,
  `drone_id` int(11) NOT NULL,
  `mission_name` varchar(100) NOT NULL,
  `location` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `points`
--

CREATE TABLE `points` (
  `id` int(11) NOT NULL,
  `name` varchar(10) NOT NULL,
  `col` int(11) NOT NULL,
  `row` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `points`
--

INSERT INTO `points` (`id`, `name`, `col`, `row`) VALUES
(1, 'A', 0, 0),
(2, 'B', 1, 0),
(3, 'C', 2, 0),
(4, 'D', 0, 1),
(5, 'E', 1, 1),
(6, 'F', 2, 1),
(7, 'G', 0, 2),
(8, 'H', 1, 2),
(9, 'I', 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `point_commands`
--

CREATE TABLE `point_commands` (
  `id` int(11) NOT NULL,
  `point_label` enum('BASE','A','B','C','D','E','F','G','H','I') NOT NULL,
  `command_sequence` text NOT NULL,
  `x_offset` int(11) DEFAULT 0,
  `y_offset` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `point_commands`
--

INSERT INTO `point_commands` (`id`, `point_label`, `command_sequence`, `x_offset`, `y_offset`) VALUES
(23, 'BASE', '', 0, -100),
(26, 'I', '', 0, 0),
(27, 'H', '', 100, 0),
(28, 'G', '', 200, 0),
(30, 'E', '', 100, 100),
(32, 'F', '', 0, 100),
(33, 'D', '', 200, 100),
(34, 'C', '', 0, 200),
(35, 'B', '', 100, 200),
(36, 'A', '', 200, 200);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `status` varchar(50) DEFAULT 'active',
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `id_number` varchar(9) NOT NULL,
  `phone_number` varchar(10) NOT NULL,
  `age` int(11) NOT NULL,
  `birth_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `status`, `first_name`, `last_name`, `email`, `id_number`, `phone_number`, `age`, `birth_date`) VALUES
(23, 'barP123', '$2b$10$jvQllJLvOodZZBUXQyqFB.rKIVDqfpduPwLbCT/6wBQm1HN3N5S46', 'user', 'active', 'bar', 'pahima', 'barpahima33@gmail.com', '316555552', '3333333300', 22, '2025-02-17'),
(24, 'iliahromAdmin', '$2b$10$Qe24sfHUiLTq/bzPSARQ/uNyRhASYu.YnbXmOKmFVoOwxsZiEGqeS', 'admin', 'active', 'ilia', 'hrom', 'iliahrom@gmail.com', '123123123', '0541231231', 34, '1990-03-16'),
(25, 'test_user', '$2b$10$Kw./FrbTBVP/ZtQ1ViEzu.WDW0im2cY/R6a8OnCDrfJEBVrDhrqU.', 'user', 'active', 'israel', 'israeli', 'test@tester.com', '333333333', '1234567890', 241321, '2025-03-06'),
(26, 'iliahrom', '$2b$10$h3JS4slylNrVvgJ7dizRE.cdPXe9HxeSx/38N44fr67Zs7N4RBptK', 'user', 'active', 'ilia', '123', 'ilia@123.com', '123456789', '0546660000', 35, '1999-12-16'),
(27, 'iliahrom1234', '$2b$10$t8LHe.9Ie826p2WL4j1mQ.bauL6ImOo8PoXYmSgENZkKiNXcmT2lm', 'admin', 'active', 'iliahrom123', 'hromchenko', 'ilia123@gmail.com', '123456789', '0541234567', 35, '1999-03-16'),
(28, 'iliahromtest123', '$2b$10$ss6wKw/4avRltoKTDBq82OrCnc7xGS1w2m2NsdrqOS2mBAAhUN5si', 'user', 'active', 'Ilia', 'Hromchenko', 'iliahrom123@gmail.com', '123456789', '0546340085', 34, '1990-03-16'),
(29, 'AvidanS', '$2b$10$sZ8HFq84D9b8LkxPph4QDuEsYyD8IgUCs0nRmt2JiShh2.gRfHDZe', 'user', 'active', 'Avidan', 'Slumi', 'AvidaB@gmail.com', '159159159', '0543320933', 36, '1989-05-10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drones`
--
ALTER TABLE `drones`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `flight_points`
--
ALTER TABLE `flight_points`
  ADD PRIMARY KEY (`label`);

--
-- Indexes for table `missions`
--
ALTER TABLE `missions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `drone_id` (`drone_id`);

--
-- Indexes for table `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `point_commands`
--
ALTER TABLE `point_commands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `point_label` (`point_label`);

--
-- Indexes for table `users`
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
  MODIFY `id` int(2) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `missions`
--
ALTER TABLE `missions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `points`
--
ALTER TABLE `points`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `point_commands`
--
ALTER TABLE `point_commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `missions`
--
ALTER TABLE `missions`
  ADD CONSTRAINT `missions_ibfk_1` FOREIGN KEY (`drone_id`) REFERENCES `drones` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: brain_game
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aim_scores`
--

DROP TABLE IF EXISTS `aim_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aim_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` int DEFAULT NULL,
  `total_clicks` int DEFAULT NULL,
  `accuracy` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aim_scores`
--

LOCK TABLES `aim_scores` WRITE;
/*!40000 ALTER TABLE `aim_scores` DISABLE KEYS */;
INSERT INTO `aim_scores` VALUES (1,25,30,83.5,'2026-05-14 05:31:54'),(2,10,11,90.9,'2026-05-14 05:36:40'),(3,17,19,89.5,'2026-05-14 05:40:34'),(4,23,23,100,'2026-05-14 05:41:12'),(5,45,45,100,'2026-05-14 14:09:03'),(6,46,47,97.9,'2026-05-14 14:09:37'),(7,30,30,100,'2026-05-25 13:31:38');
/*!40000 ALTER TABLE `aim_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `focus_grid_scores`
--

DROP TABLE IF EXISTS `focus_grid_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `focus_grid_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_reached` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_attempts` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `focus_grid_scores`
--

LOCK TABLES `focus_grid_scores` WRITE;
/*!40000 ALTER TABLE `focus_grid_scores` DISABLE KEYS */;
INSERT INTO `focus_grid_scores` VALUES (1,4,30,3,'2026-05-18 05:32:47');
/*!40000 ALTER TABLE `focus_grid_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `multiplayer_game_results`
--

DROP TABLE IF EXISTS `multiplayer_game_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multiplayer_game_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_code` varchar(50) NOT NULL,
  `game_name` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL,
  `score` int NOT NULL,
  `is_winner` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `multiplayer_game_results`
--

LOCK TABLES `multiplayer_game_results` WRITE;
/*!40000 ALTER TABLE `multiplayer_game_results` DISABLE KEYS */;
INSERT INTO `multiplayer_game_results` VALUES (1,'MQATJC','Reaction Test','Bhavisha',100,1,'2026-06-03 05:02:24');
/*!40000 ALTER TABLE `multiplayer_game_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `number_sequence_scores`
--

DROP TABLE IF EXISTS `number_sequence_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `number_sequence_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_reached` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_attempts` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `number_sequence_scores`
--

LOCK TABLES `number_sequence_scores` WRITE;
/*!40000 ALTER TABLE `number_sequence_scores` DISABLE KEYS */;
INSERT INTO `number_sequence_scores` VALUES (1,4,40,6,'2026-05-18 04:58:49'),(2,2,10,2,'2026-05-18 05:06:00'),(3,5,40,5,'2026-05-18 07:10:29'),(4,7,60,7,'2026-05-25 13:04:51');
/*!40000 ALTER TABLE `number_sequence_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `odd_color_scores`
--

DROP TABLE IF EXISTS `odd_color_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `odd_color_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_reached` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_clicks` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `odd_color_scores`
--

LOCK TABLES `odd_color_scores` WRITE;
/*!40000 ALTER TABLE `odd_color_scores` DISABLE KEYS */;
INSERT INTO `odd_color_scores` VALUES (1,11,100,11,'2026-05-18 05:23:31'),(2,37,360,37,'2026-05-25 13:33:00');
/*!40000 ALTER TABLE `odd_color_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scores`
--

DROP TABLE IF EXISTS `scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `game_name` varchar(100) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `reaction_time` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scores`
--

LOCK TABLES `scores` WRITE;
/*!40000 ALTER TABLE `scores` DISABLE KEYS */;
INSERT INTO `scores` VALUES (1,'Reaction Game',250,0.45,'2026-05-14 04:28:01'),(2,'Memory Game',180,NULL,'2026-05-14 04:30:37'),(3,'Reaction Game',10,0.45,'2026-05-14 04:34:41'),(4,'Memory Game',80,NULL,'2026-05-14 04:34:47'),(5,'Reaction Game',100,0.578,'2026-05-14 04:39:52'),(6,'Reaction Game',100,0.53,'2026-05-14 04:40:52'),(7,'Reaction Game',100,1.073,'2026-05-14 04:40:59'),(8,'Reaction Game',100,0.557,'2026-05-14 04:41:13'),(9,'Reaction Game',100,0.124,'2026-05-14 04:54:20'),(10,'Reaction Game',100,0.549,'2026-05-14 04:54:33'),(11,'Reaction Game',100,0.551,'2026-05-14 04:58:57'),(12,'Reaction Game',100,0.615,'2026-05-14 04:59:06'),(13,'Reaction Game',100,0.631,'2026-05-14 05:38:33'),(14,'Reaction Game',100,0.609,'2026-05-14 05:38:48'),(15,'Reaction Game',100,0.445,'2026-05-14 14:07:54'),(16,'Reaction Game',100,0.394,'2026-05-14 14:08:02'),(17,'Reaction Game',100,0.401,'2026-05-14 14:08:09'),(18,'Reaction Game',100,0.402,'2026-05-14 14:08:13'),(19,'Reaction Game',100,2.209,'2026-05-14 14:08:22'),(20,'Reaction Game',100,0.401,'2026-05-14 14:08:28'),(21,'Reaction Game',100,0.924,'2026-05-18 07:10:58'),(22,'Reaction Game',100,0.626,'2026-05-18 07:11:03'),(23,'Reaction Game',100,0.661,'2026-05-18 07:11:10'),(24,'Reaction Game',100,0.678,'2026-05-18 07:11:14'),(25,'Reaction Game',100,4.167,'2026-05-18 07:11:22'),(26,'Reaction Game',100,0.48,'2026-05-18 07:11:29'),(27,'Reaction Game',100,0.432,'2026-05-18 07:11:36'),(28,'Reaction Game',100,0.816,'2026-05-18 07:11:40'),(29,'Reaction Game',100,0.668,'2026-05-25 12:42:22'),(30,'Reaction Game',100,0.018,'2026-05-25 12:42:28'),(31,'Reaction Game',100,1.201,'2026-05-25 12:42:34'),(32,'Reaction Game',100,0.989,'2026-05-25 13:33:34'),(33,'Reaction Game',100,1.724,'2026-06-03 05:02:24');
/*!40000 ALTER TABLE `scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `simon_scores`
--

DROP TABLE IF EXISTS `simon_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `simon_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_reached` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `total_moves` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `simon_scores`
--

LOCK TABLES `simon_scores` WRITE;
/*!40000 ALTER TABLE `simon_scores` DISABLE KEYS */;
INSERT INTO `simon_scores` VALUES (1,5,50,20,'2026-05-14 06:07:33'),(2,1,0,1,'2026-05-14 06:08:52'),(3,1,0,1,'2026-05-14 06:13:28'),(4,3,20,3,'2026-05-18 07:09:41');
/*!40000 ALTER TABLE `simon_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stroop_scores`
--

DROP TABLE IF EXISTS `stroop_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stroop_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` int DEFAULT NULL,
  `accuracy` float DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stroop_scores`
--

LOCK TABLES `stroop_scores` WRITE;
/*!40000 ALTER TABLE `stroop_scores` DISABLE KEYS */;
INSERT INTO `stroop_scores` VALUES (1,8,80,10,'2026-05-14 05:48:46'),(2,6,46.2,13,'2026-05-14 05:52:37'),(3,19,100,19,'2026-05-14 05:53:25'),(4,4,80,5,'2026-05-14 05:54:06'),(5,18,100,18,'2026-05-14 05:54:39'),(6,0,0,0,'2026-05-14 05:56:26'),(7,16,76.2,21,'2026-05-14 14:10:12'),(8,30,90.9,33,'2026-05-14 14:10:45');
/*!40000 ALTER TABLE `stroop_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sudoku_scores`
--

DROP TABLE IF EXISTS `sudoku_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sudoku_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `level_reached` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `completed_time` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sudoku_scores`
--

LOCK TABLES `sudoku_scores` WRITE;
/*!40000 ALTER TABLE `sudoku_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `sudoku_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `typing_scores`
--

DROP TABLE IF EXISTS `typing_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `typing_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wpm` int DEFAULT NULL,
  `accuracy` float DEFAULT NULL,
  `total_time` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `typing_scores`
--

LOCK TABLES `typing_scores` WRITE;
/*!40000 ALTER TABLE `typing_scores` DISABLE KEYS */;
INSERT INTO `typing_scores` VALUES (1,45,92.5,30,'2026-05-14 05:18:19');
/*!40000 ALTER TABLE `typing_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Bhavisha','bhavisha@gmail.com','$2b$12$QKmeUxgqwyMZsWqtsrqDI.ARcUqQKDaonDS5hGSXSxRUJ0rxFhVOO',NULL,'2026-05-25 12:40:56','2026-05-25 12:40:56'),(2,'Drashti','drashti@gmail.com','$2b$12$P5qWfY73RYrLFt3itQYv4u8Skg085pt/fl55jCtRewmp9JwC6xGEy',NULL,'2026-05-26 03:56:11','2026-05-26 03:56:11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wrong_answer_scores`
--

DROP TABLE IF EXISTS `wrong_answer_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wrong_answer_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wrong_answer_scores`
--

LOCK TABLES `wrong_answer_scores` WRITE;
/*!40000 ALTER TABLE `wrong_answer_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `wrong_answer_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hot_potato_scores`
--

DROP TABLE IF EXISTS `hot_potato_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hot_potato_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hot_potato_scores`
--

LOCK TABLES `hot_potato_scores` WRITE;
/*!40000 ALTER TABLE `hot_potato_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `hot_potato_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'brain_game'
--
/*!50003 DROP PROCEDURE IF EXISTS `add_aim_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_aim_score`(
    IN p_score INT,
    IN p_total_clicks INT,
    IN p_accuracy FLOAT)
begin
	    INSERT INTO aim_scores(

        score,
        total_clicks,
        accuracy

    )

    VALUES(

        p_score,
        p_total_clicks,
        p_accuracy

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_focus_grid_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_focus_grid_score`(
    IN p_level_reached INT,
    IN p_score INT,
    IN p_total_attempts INT)
begin
	  INSERT INTO focus_grid_scores(

        level_reached,
        score,
        total_attempts

    )

    VALUES(

        p_level_reached,
        p_score,
        p_total_attempts

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_memory_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_memory_score`(
    IN p_score INT
)
begin
	 INSERT INTO scores(

        game_name,
        score

    )

    VALUES(

        'Memory Game',
        p_score

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_number_sequence_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_number_sequence_score`(

    IN p_level_reached INT,
    IN p_score INT,
    IN p_total_attempts INT)
begin
	    INSERT INTO number_sequence_scores(

        level_reached,
        score,
        total_attempts

    )

    VALUES(

        p_level_reached,
        p_score,
        p_total_attempts

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_odd_color_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_odd_color_score`(

    IN p_level_reached INT,
    IN p_score INT,
    IN p_total_clicks INT
)
begin
	    INSERT INTO odd_color_scores(

        level_reached,
        score,
        total_clicks

    )

    VALUES(

        p_level_reached,
        p_score,
        p_total_clicks

    );

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_reaction_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_reaction_score`(

    IN p_score INT,
    IN p_reaction_time FLOAT
)
begin
	    INSERT INTO scores(

        game_name,
        score,
        reaction_time

    )

    VALUES(

        'Reaction Game',
        p_score,
        p_reaction_time

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_simon_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_simon_score`(
    IN p_level_reached INT,
    IN p_score INT,
    IN p_total_moves INT
)
begin
	
    INSERT INTO simon_scores(

        level_reached,
        score,
        total_moves

    )

    VALUES(

        p_level_reached,
        p_score,
        p_total_moves

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_stroop_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_stroop_score`(
    IN p_score INT,
    IN p_accuracy FLOAT,
    IN p_total_questions INT)
begin
	INSERT INTO stroop_scores(
        score,
        accuracy,
        total_questions
    )
    VALUES(
        p_score,
        p_accuracy,
        p_total_questions
    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_sudoku_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_sudoku_score`(
    IN p_level_reached INT,
    IN p_score INT,
    IN p_completed_time INT)
begin
	  INSERT INTO sudoku_scores(

        level_reached,
        score,
        completed_time

    )

    VALUES(

        p_level_reached,
        p_score,
        p_completed_time

    );

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_typing_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_typing_score`(
    IN p_wpm INT,
    IN p_accuracy FLOAT,
    IN p_total_time FLOAT)
begin
	    INSERT INTO typing_scores(

        wpm,
        accuracy,
        total_time

    )

    VALUES(

        p_wpm,
        p_accuracy,
        p_total_time

    );
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_login_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_login_user`(
  IN p_email VARCHAR(255))
begin
	  SELECT
        user_id,
        username,
        email,
        password,
        avatar,
        created_at
    FROM users
    WHERE email = p_email
    LIMIT 1;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_register_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_register_user`(
	IN p_username VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255))
begin
	 DECLARE email_count INT;

    -- Check if email already exists
    SELECT COUNT(*) 
    INTO email_count
    FROM users
    WHERE email = p_email;

    IF email_count > 0 THEN
    
        select
	false as success,
	'Email already exists' as message;
    ELSE
        INSERT INTO users (
            username,
            email,
            password
        )
        VALUES (
            p_username,
            p_email,
            p_password
        );

        SELECT 
            TRUE AS success,
            'User registered successfully' AS message;
    END IF;
END ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_wrong_answer_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_wrong_answer_score`(
    IN p_score INT
)
BEGIN
    INSERT INTO wrong_answer_scores(score)
    VALUES(p_score);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `add_hot_potato_score` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_hot_potato_score`(
    IN p_score INT
)
BEGIN
    INSERT INTO hot_potato_scores(score)
    VALUES(p_score);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 10:46:27

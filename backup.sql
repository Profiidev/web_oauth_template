--
-- PostgreSQL database cluster dump
--

\restrict sEtgXLDSphG9ZVAXTwmVzuhFMgg0BEJhmuUeW4O1wQFnrVOMxdHjFfgX80qM8c7

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE test;
ALTER ROLE test WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:UY1ZfE3ZA6ni+n4EpVwX8w==$STya7BKhuc7VE5O/q4Fsk3N2atEZpz5FFC/QSuo6Q+w=:7hJpL0ikOB3i6MvYW1bLAQM+yGE93zOBiVKRVVD08zc=';

--
-- User Configurations
--








\unrestrict sEtgXLDSphG9ZVAXTwmVzuhFMgg0BEJhmuUeW4O1wQFnrVOMxdHjFfgX80qM8c7

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict COqoJ5m3QD0K1PCpNyZaEOe5zZov2cvOjVr9oQ7qH570OA8OBfJ0XcVzwgDadBC

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict COqoJ5m3QD0K1PCpNyZaEOe5zZov2cvOjVr9oQ7qH570OA8OBfJ0XcVzwgDadBC

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict nkG159efkv2RszT7Sq2fJFfubNUZJo21HHfYck3hQrNSIuXMCdB0HjiqdnRJhId

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict nkG159efkv2RszT7Sq2fJFfubNUZJo21HHfYck3hQrNSIuXMCdB0HjiqdnRJhId

--
-- Database "test" dump
--

--
-- PostgreSQL database dump
--

\restrict iFBckh3pibSaVROvynDFlGaaECA98nQG0wwes2CPRWEX3upnWERPC8tE0M5Scq9

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: test; Type: DATABASE; Schema: -; Owner: test
--

CREATE DATABASE test WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE test OWNER TO test;

\unrestrict iFBckh3pibSaVROvynDFlGaaECA98nQG0wwes2CPRWEX3upnWERPC8tE0M5Scq9
\connect test
\restrict iFBckh3pibSaVROvynDFlGaaECA98nQG0wwes2CPRWEX3upnWERPC8tE0M5Scq9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict iFBckh3pibSaVROvynDFlGaaECA98nQG0wwes2CPRWEX3upnWERPC8tE0M5Scq9

--
-- PostgreSQL database cluster dump complete
--


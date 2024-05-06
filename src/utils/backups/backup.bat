@echo off

pg_dump "password=%1 host=%2 user=%3 port=%4 dbname=%5" > %6 

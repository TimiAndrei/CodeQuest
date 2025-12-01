# CodeQuest

CodeQuest este o platformă educațională web concepută pentru a transforma învățarea programării într-o experiență accesibilă, interactivă și antrenantă. Prin exerciții de codare, provocări și un sistem de recompense bazat pe gamification, CodeQuest stimulează progresul utilizatorilor și încurajează învățarea practică într-un mediu suportiv.

## Requirements

- Docker and Docker Compose

## Runnning the project

1. Clone the repository
2. Run `docker-compose up` in the root of the project
3. Access the database admin dashboard at `localhost:8080`
4. Access the backend documentation at `localhost:8000/docs`
5. Access the frontend at `localhost:3000`
6. To have the compiler working, you need to download the judge0 local version and start its docker containers.
   The containers should be named by default similarly to this:
   judge0-v1130-server-1
   judge0-v1130-worker-1
   judge0-v1130-redis-1
   judge0-v1130-db-1
   docker network connect codequest-network judge0-v1130-server-1
   docker network connect codequest-network judge0-v1130-worker-1
   docker network connect codequest-network judge0-v1130-redis-1
   docker network connect codequest-network judge0-v1130-db-1

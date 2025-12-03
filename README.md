# CodeQuest

CodeQuest este o platformă educațională web concepută pentru a transforma învățarea programării într-o experiență accesibilă, interactivă și antrenantă. Prin exerciții de codare, provocări și un sistem de recompense bazat pe gamification, CodeQuest stimulează progresul utilizatorilor și încurajează învățarea practică într-un mediu suportiv.

## Requirements

- Docker and Docker Compose

## Runnning the project

1. Clone the repository
2. Run `docker-compose up --build` in the root of the project
3. Access the database admin dashboard at `localhost:8080`
4. Access the backend documentation at `localhost:8000/docs`
5. Access the frontend at `localhost:3000`
6. To have the compiler working, you need to download the judge0 local version and start its docker containers.
   The containers should be named by default similarly to this:
   judge0-v1130-server-1
   judge0-v1130-worker-1
   judge0-v1130-redis-1
   judge0-v1130-db-1

To make the containers communicate with the rest of the application, add them to the codequest-network network.
To do this, run the following commands:

```bash
docker network create codequest-network
docker network connect codequest-network judge0-v1130-server-1
docker network connect codequest-network judge0-v1130-worker-1
docker network connect codequest-network judge0-v1130-redis-1
docker network connect codequest-network judge0-v1130-db-1
```

Note: You can do this either before or after starting the rest of the application containers.

Note: If something fails for some reason, manually add the other containers to the network as well:

```bash
docker network connect codequest-network codequest-backend-1
docker network connect codequest-network codequest-frontend-1
docker network connect codequest-network codequest-db-1
```

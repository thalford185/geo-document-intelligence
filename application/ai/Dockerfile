FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y wget poppler-utils
COPY requirements.txt requirements.txt
RUN pip install \
    --no-cache-dir \
    -r requirements.txt
COPY . .
CMD ["uvicorn",  "entrypoints.api.main:app", "--host", "0.0.0.0", "--port", "80"]
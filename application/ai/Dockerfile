FROM pytorch/pytorch:2.6.0-cuda12.6-cudnn9-runtime
WORKDIR /app
RUN apt-get update && apt-get install -y wget poppler-utils
COPY requirements.txt requirements.txt
RUN pip3 install \
    --no-cache-dir \
    --break-system-packages \
    -r requirements.txt
COPY . .
CMD ["uvicorn",  "entrypoints.api.main:app", "--host", "0.0.0.0", "--port", "80"]
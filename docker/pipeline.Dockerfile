FROM python:3.12-slim

WORKDIR /pipeline

# Install system deps (for Pillow)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
 && rm -rf /var/lib/apt/lists/*

COPY data_pipeline/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY data_pipeline/ .

ENTRYPOINT ["python", "main.py"]

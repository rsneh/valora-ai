from fastapi import FastAPI

app = FastAPI(title="AidSell API")


@app.get("/")
async def read_root():
    return {"message": "Welcome to the AidSell API!"}
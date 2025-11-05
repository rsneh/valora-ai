from langsmith import traceable
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.messages import HumanMessage


@traceable(run_type="llm")
def invoke_llm(prompt, model_name: str = "gemini-2.0-flash-001"):
    model = ChatGoogleGenerativeAI(model=model_name, temperature=0.7)
    response = model.invoke(prompt)
    return parse_output(response)


@traceable
def parse_output(response):
    return response


@traceable(run_type="llm")
def invoke_gemini_with_image(
    prompt, image_url, model_name: str = "gemini-2.0-flash-001"
):
    model = ChatGoogleGenerativeAI(model=model_name, temperature=0.7)
    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": prompt,
            },
            {
                "type": "image_url",
                "image_url": image_url,
            },
        ]
    )
    response = model.invoke([message])
    return parse_output(response)

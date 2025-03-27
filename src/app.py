import os
import streamlit as st
from dotenv import load_dotenv
from services.text_processing import extract_text_from_txt
from services.embeddings import store_embeddings
from services.retrieval import retrieve_documents
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.schema import SystemMessage

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Initialize ChromaDB collections
import chromadb
chroma_client = chromadb.PersistentClient(path="chroma_db")
case_collection = chroma_client.get_or_create_collection("case_data")
memory_collection = chroma_client.get_or_create_collection("chat_memory")

# Load Sherlock Holmes prompt
with open("src/templates/sherlock_prompt.txt", "r") as file:
    sherlock_prompt_template = file.read()

prompt_template = PromptTemplate(
    template=sherlock_prompt_template,
    input_variables=["query", "memory_context", "case_context"]
)

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.2, openai_api_key=openai_api_key)

def update_memory(query, response):
    """Stores user queries and responses for context retention."""
    memory_collection.add(
        ids=[f"memory_{len(memory_collection.get()['ids'])}"],
        embeddings=[[0] * 384],  # Placeholder embeddings
        metadatas=[{"query": query, "response": response}]
    )

def retrieve_memory(query):
    """Retrieves past responses from memory."""
    try:
        results = memory_collection.query(query_texts=[query], n_results=3)
        if results.get("metadatas"):
            return [doc["response"] for doc in results["metadatas"][0]]
        return []
    except Exception:
        return []

def answer_query(query):
    """Processes a user query with memory, case retrieval, and LLM."""
    memory_context = "\n".join(retrieve_memory(query))
    case_context = "\n".join(retrieve_documents(case_collection, query))

    final_prompt = prompt_template.format(
        query=query,
        memory_context=memory_context,
        case_context=case_context
    )

    response = llm.invoke([SystemMessage(content=final_prompt)]).content
    update_memory(query, response)
    return response

# Streamlit UI
st.set_page_config(page_title="Sherlock Holmes AI", page_icon="🕵️‍♂️", layout="wide")
st.title("Sherlock Holmes AI")

if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

query = st.text_input("Ask Sherlock Holmes a question:")
if query:
    with st.spinner("🔎 Sherlock is thinking..."):
        response = answer_query(query)

    st.session_state.chat_history.append(("User", query))
    st.session_state.chat_history.append(("🕵️ Sherlock", response))

for role, msg in st.session_state.chat_history:
    if role == "User":
        st.markdown(f"**🧑‍💼 {role}:** {msg}")
    else:
        st.markdown(f"**🕵️ {role}:** {msg}")

st.write("💬 **Sherlock remembers previous interactions!**")
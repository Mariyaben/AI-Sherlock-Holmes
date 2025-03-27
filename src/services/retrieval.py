def retrieve_documents(collection, query, k=5):
    """Retrieves relevant excerpts from ChromaDB."""
    try:
        results = collection.query(query_texts=[query], n_results=k)
        if results.get("metadatas") and len(results["metadatas"]) > 0:
            return [doc["text"] for doc in results["metadatas"][0] if "text" in doc]
        return []
    except Exception as e:
        raise RuntimeError(f"Error retrieving documents: {e}")
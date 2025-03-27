from sentence_transformers import SentenceTransformer

def store_embeddings(collection, data_dict, model_name="all-MiniLM-L6-v2", batch_size=100):
    """Stores extracted text embeddings into a ChromaDB collection."""
    model = SentenceTransformer(model_name)

    for filename, text in data_dict.items():
        text_chunks = text.split("\n\n")
        existing_ids = set(collection.get()["ids"] if collection.get() else [])

        for i in range(0, len(text_chunks), batch_size):
            batch = text_chunks[i:i+batch_size]
            embeddings = model.encode(batch).tolist()
            ids = [f"{filename}_{idx}" for idx in range(i, i+len(batch))]

            new_data = [(id, emb, txt) for id, emb, txt in zip(ids, embeddings, batch) if id not in existing_ids]

            if new_data:
                collection.add(
                    ids=[x[0] for x in new_data],
                    embeddings=[x[1] for x in new_data],
                    metadatas=[{"filename": filename, "text": x[2]} for x in new_data]
                )
import hashlib
import numpy as np

def store_embeddings(collection, data_dict, model_name="all-MiniLM-L6-v2", batch_size=100):
    """Stores extracted text embeddings into a ChromaDB collection using simple text hashing."""
    
    for filename, text in data_dict.items():
        text_chunks = text.split("\n\n")
        existing_ids = set(collection.get()["ids"] if collection.get() else [])

        for i in range(0, len(text_chunks), batch_size):
            batch = text_chunks[i:i+batch_size]
            # Create simple embeddings using text hashing (temporary workaround)
            embeddings = []
            for text_chunk in batch:
                # Create a simple hash-based embedding
                hash_obj = hashlib.md5(text_chunk.encode())
                hash_bytes = hash_obj.digest()
                # Convert to a 384-dimensional vector (like the original model)
                embedding = [float(b) for b in hash_bytes] * (384 // len(hash_bytes)) + [float(b) for b in hash_bytes][:(384 % len(hash_bytes))]
                embeddings.append(embedding)
            
            ids = [f"{filename}_{idx}" for idx in range(i, i+len(batch))]

            new_data = [(id, emb, txt) for id, emb, txt in zip(ids, embeddings, batch) if id not in existing_ids]

            if new_data:
                collection.add(
                    ids=[x[0] for x in new_data],
                    embeddings=[x[1] for x in new_data],
                    metadatas=[{"filename": filename, "text": x[2]} for x in new_data]
                )